import {OrderDocument, OrderModel, OrderProps} from "../../models/orders/order.model";
import {ErrorResponse} from "../../utils";
import {RestaurantService} from "../restaurant.service";
import {ReductionService} from "../reduction.service";
import {ProductModel} from "../../models/product/mongoose.product.model";
import {OrderStatus} from "./order.status";
import {ReductionModel} from "../../models/reduction.model";
import {MenuModel} from "../../models/menus/menu.model";
import {UserDocument, UserModel} from "../../models";
import {AuthService} from "../auth.service";
import {DeliverymenService} from "../deliverymen/deliverymen.service";
import {DeliverymenStatus} from "../deliverymen/domain/deliverymen.status";
import {Roles} from "../../utils/roles";
import {ChatDocument, ChatModel} from "../../models/chat.model";


type OrderWithoutId = Omit<OrderProps, "_id">

export class OrderService {

    private static instance: OrderService

    private chatErrMsg: string = "The chat is unavailable for this order"


    public static getInstance(): OrderService {
        if (OrderService.instance === undefined) {
            OrderService.instance = new OrderService()
        }
        return OrderService.instance
    }

    private deliverymenService = DeliverymenService.getInstance();

    public async createOrder(order: OrderWithoutId): Promise<OrderProps> {

        await this.verifyOrder(order);
        const amountOfOrder = await OrderService.computeOrderAmount(order);
        const isAddressInOrder = !!order.address ;
        const deliveryman = isAddressInOrder
            ? await this.deliverymenService.getNearestAvailableDeliverymanFromTheRestaurant(order.restaurant)
            : undefined;
        return new OrderModel({
            restaurant: order.restaurant,
            menus: order.menus,
            reductionId: order.reductionId,
            products: order.products,
            amount: amountOfOrder,
            status: OrderStatus[0],
            customer: order.customer,
            deliverymanId: deliveryman?.id.value,
            address: order.address
        }).save();

    }

    private async verifyOrder(order: OrderWithoutId): Promise<void | never> {

        const restaurant = await RestaurantService.getInstance().getOneRestaurant(order.restaurant!);
        if (!restaurant) throw new ErrorResponse(`Restaurant ${order.restaurant} not found.`, 404)

        if (!order.products && !order.menus) {
            throw new ErrorResponse("Empty order", 412)
        }

        if (order.reductionId) {
            const reduction = await ReductionService.getInstance().getReductionById(order.reductionId);
            if (reduction.restaurant !== restaurant?._id.toString() || reduction.status === 0) {
                throw new ErrorResponse(`Wrong reduction id ${order.reductionId}`, 400)
            }
        }

        if(order.products) {
            order.products.forEach(product => {
                if (!restaurant.products!.includes(product))
                    throw new ErrorResponse(`Product ${product} not in restaurant ${restaurant._id}.`, 404);
            })
        }

        if(order.menus){
            order.menus.forEach(menuId => {
                if (!restaurant.menus!.includes(menuId))
                    throw new ErrorResponse(`Menu ${menuId} not in restaurant ${restaurant._id}.`, 404);
            })
        }
    }


    private static async computeOrderAmount(order: OrderWithoutId) {
        let amount = 0;
        let reduction = null;
        let price;
        if (order.products) for (const productId of order.products!) {
            const product = await ProductModel.findById(productId)
            if (product)
                reduction = await ReductionModel.findOne({
                    status: 1,
                    restaurant: order.restaurant,
                    product: product._id,
                });
            price = !reduction ? product.price : product.price - (product.price * (reduction.amount / 100));
            amount += price;
        }

        if (order.menus) for (const menuId of order.menus!) {
            const menu = await MenuModel.findById(menuId)
            amount += menu.amount;
        }
        return amount;

    }

    async getOrdersByRestaurantIdAndStatus(restaurantId: string, authToken: string, status: string): Promise<OrderDocument[]> {
        const isAStaffMember = await RestaurantService.getInstance().verifyStaffRestaurant(restaurantId, authToken, "OrderPicker")
            || await RestaurantService.getInstance().verifyStaffRestaurant(restaurantId, authToken, "Admin")
        if (isAStaffMember)
            return await OrderModel.find({
                restaurant: restaurantId,
                status: status
            });

        throw new ErrorResponse("you're not a staff member of this restaurant", 403);
    }

    async getOrdersByStatusAndUserId(status: string, userId: string, authToken: string) {

        const isTheRightCustomer = await AuthService.getInstance().verifyIfUserRequestedIsTheUserConnected(authToken, userId);
        if (!isTheRightCustomer)
            throw new ErrorResponse("you don't have tight to see this order", 401)

        return await OrderModel.find({
            status: status,
            customer: userId
        }).exec();
    }

    async updateOrder(orderId: string, newStatus: string | undefined, authToken: string): Promise<boolean> {
        const order: OrderDocument = await OrderModel.findOne({_id: orderId}).exec();
        if (!order) throw new ErrorResponse(`Order ${orderId} not found.`, 404);
        if (!newStatus) return false;
        if (!this.isStatusNextFromCurrentStatus(newStatus, order.status))
            throw new ErrorResponse(`Cannot change status from ${order.status} to ${newStatus}.`, 422);

        const isOrderPicker = await RestaurantService.getInstance().verifyStaffRestaurant(order.restaurant, authToken, "OrderPicker");
        const isDeliveryMan = await AuthService.getInstance().isValidRole(authToken, "DeliveryMan")
        if (isOrderPicker && this.isStatusNextFromCurrentStatus(newStatus, order.status)) {
            if (newStatus === "onTheWay" && !order.address) throw new ErrorResponse("No address given", 400)
            if (newStatus === "done" && order.address) throw new ErrorResponse("Order can't be handed out", 400)
            if (this.isStatusNextFromCurrentStatus(newStatus, order.status)) {
                order.status = newStatus;
                this.dispatchOrderStatusChanged(order);
                return await order.save() !== null;
            }
        }
        if (isDeliveryMan && order.status === "onTheWay") {
            order.status = newStatus;
            return await order.save() !== null;
        }
        return false
    }

    private dispatchOrderStatusChanged(order: OrderDocument): void {
        if (!order.deliverymanId) return;
        let newDeliverymanStatus: DeliverymenStatus;
        switch (order.status) {
            case "onTheWay":
                newDeliverymanStatus = DeliverymenStatus.delivering;
                break;
            case "delivered":
                newDeliverymanStatus = DeliverymenStatus.available;
                break;
            default:
                return;
        }
        this.deliverymenService.updateDeliverymanStatus(
            order.deliverymanId,
            newDeliverymanStatus
        );
    }

    isStatusNextFromCurrentStatus(newOrderStatus: string, currentOrderStatus: string): Boolean {
        const oldToNextStatus: { [oldStatus: string]: string[] } = {
            "created": ["inProgress"],
            "inProgress": ["done", "onTheWay"],
            "onTheWay": ["delivered"]
        };
        return oldToNextStatus[currentOrderStatus].includes(newOrderStatus);
    }

    private async verifyUserInChat(authToken: string, userRole: string, order: OrderDocument) {
        if (userRole === Roles.Customer.toString()) {
            if (!order.customer) throw new ErrorResponse(this.chatErrMsg, 400)
            const isOrderCustomer: Boolean = await AuthService.getInstance().verifyIfUserRequestedIsTheUserConnected(authToken, order.customer)
            if (!isOrderCustomer) throw new ErrorResponse("You're not allowed to view this chat", 403)
        } else if (userRole === Roles.DeliveryMan.toString()) {
            if (!order.deliverymanId) throw new ErrorResponse(this.chatErrMsg, 400)
            const isOrderDeliveryman: Boolean = await AuthService.getInstance().verifyIfUserRequestedIsTheUserConnected(authToken, order.deliverymanId)
            if (!isOrderDeliveryman) throw new ErrorResponse("You're not allowed to view this chat", 403)
        }
    }

    async getOrderChat(orderId: string, authToken: string): Promise<ChatDocument[]> {
        const order: OrderDocument = await OrderModel.findById(orderId).exec()
        const user: UserDocument = await UserModel.findOne({
            session: authToken
        }).exec()
        if (!order || !user) throw new ErrorResponse("Unauthorized", 401)

        if (order.status !== "onTheWay") throw new ErrorResponse(this.chatErrMsg, 400)
        await this.verifyUserInChat(authToken, user.role, order)

        return await ChatModel.find({
            order: orderId
        }).exec()
    }

    async sendInOrderChat(orderId: string, authToken: string, message: string) {
        const order: OrderDocument = await OrderModel.findById(orderId).exec()
        const user: UserDocument = await UserModel.findOne({
            session: authToken
        }).exec()
        if (!order || !user) throw new ErrorResponse("Unauthorized", 401)

        if (order.status !== "onTheWay") throw new ErrorResponse(this.chatErrMsg, 400)
        await this.verifyUserInChat(authToken, user.role, order)

        if (!message) throw new ErrorResponse("Message can't be empty", 412)
        return new ChatModel({
            order: orderId,
            sender: user._id,
            message: message,
            date: new Date()
        }).save()
    }
}
