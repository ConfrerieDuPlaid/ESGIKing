
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
import {Roles} from "../../utils/roles";
import {ChatDocument, ChatModel} from "../../models/chat.model";



type OrderWithoutId = Partial<OrderProps>

export class OrderService {

    private static instance: OrderService

    private chatErrMsg: string = "The chat is unavailable for this order"


    public static getInstance (): OrderService {
        if (OrderService.instance === undefined) {
            OrderService.instance = new OrderService()
        }
        return OrderService.instance
    }

    private constructor() { }

    public async createOrder (Order: OrderWithoutId): Promise<OrderProps | Boolean> {

        const verifyOrder = await this.verifyOrder(Order)
        if(!verifyOrder) {
            return false;
        }

        const amoutOfOrder = await this.computeOrderAmount(Order);

        const model = new OrderModel({
            restaurant: Order.restaurant,
            menus: Order.menus,
            reductionId: Order.reductionId,
            products: Order.products,
            amount: amoutOfOrder,
            status: OrderStatus[0],
            customer: Order.customer,
            address: Order.address

        })

        const newOrder = await model.save();
        if(newOrder){
            return newOrder;
        }else{
            return false;
        }

    }

    private async verifyOrder(Order: OrderWithoutId) {

        const restaurant = await RestaurantService.getInstance().getOneRestaurant(Order.restaurant!);

        if (!restaurant) {
            return false;
        }

        if(Order.reductionId){
            const reduction = await ReductionService.getInstance().getReductionById(Order.reductionId);
            if(reduction.restaurant != restaurant?._id.toString() || reduction.status == 0){
                throw new ErrorResponse("Wrong reduction id", 400)
            }
        }

        if (!Order.products && !Order.menus) {
            throw new ErrorResponse("Empty order", 412)
        }

        let productIsInTheRestaurant = true;
        if (Order.products && Order.products!.length > 0) Order.products.forEach(elm => {
            if(!restaurant.products!.includes(elm)){
                productIsInTheRestaurant = false;
                return ;
            }
        })

        let menuIsInTheRestaurant = true;
        if (Order.menus) Order.menus.forEach(elm => {
            if(!restaurant.menus!.includes(elm)){
                menuIsInTheRestaurant = false;
                return ;
            }
        })
        return productIsInTheRestaurant && menuIsInTheRestaurant;

    }


    private async computeOrderAmount(Order: OrderWithoutId) {
        let amount = 0;
        let reduction = null;
        let price;
        if (Order.products) for (const elm of Order.products!) {
            const product = await ProductModel.findById(elm)
            if (product)
                reduction = await ReductionModel.findOne({
                    status: 1,
                    restaurant: Order.restaurant,
                    product: product._id,
                });
            price = !reduction ? product.price : product.price - (product.price * (reduction.amount / 100));
            amount += price;
        }

        if (Order.menus) for (const elm of Order.menus!) {
            const menu = await MenuModel.findById(elm)
            if(menu)
                amount += menu.amount;
        }

        return amount;
    }

    async getOrdersByRestaurantIdAndStatus(restaurantId: string, authToken: string, status: string) : Promise<OrderDocument[]> {
        const isAStaffMember = await RestaurantService.getInstance().verifyStaffRestaurant(restaurantId, authToken, "OrderPicker")
            || await RestaurantService.getInstance().verifyStaffRestaurant(restaurantId, authToken, "Admin")
        if(isAStaffMember)
            return await OrderModel.find({
                restaurant: restaurantId,
                status: status
            });

        throw new ErrorResponse("you're not a staff member of this restaurant", 403);
    }

    async getOrdersByStatusAndUserId(status: string, userId: string, authToken: string){

        const isTheRightCustomer = await AuthService.getInstance().verifyIfUserRequestedIsTheUserConnected(authToken, userId);
        if(!isTheRightCustomer)
            throw new ErrorResponse("you don't have tight to see this order", 401)

        return await OrderModel.find({
            status: status,
            customer: userId
        }).exec();
    }

    async updateOrder(orderId: string, newStatus: string , authToken: string): Promise<Boolean> {
        const order = await OrderModel.findOne({_id: orderId}).exec();
        if(!order)
            return false;

        const isOrderPicker = await RestaurantService.getInstance().verifyStaffRestaurant(order.restaurant, authToken, "OrderPicker");
        if(isOrderPicker && this.isStatusNextFromCurrentStatus(newStatus, order.status)){
            if (newStatus === "onTheWay" && !order.address) throw new ErrorResponse("Order can't be delivered", 400)
            order.status = newStatus;
            return await order.save() !== null;
        }
        return false
    }

    isStatusNextFromCurrentStatus(newOrderStatus: string, currentOrderStatus: string): Boolean{
        const oldToNextStatus: { [oldStatus:string]: string[] } = {
            "created" : ["inProgress"] ,
            "inProgress": ["done", "onTheWay"],
        };

        return oldToNextStatus[currentOrderStatus].includes(newOrderStatus);
    }

    private async verifyUserInChat (authToken: string, userRole: string, order: OrderDocument) {
        if (userRole === Roles.Customer.toString()) {
            if (!order.customer) throw new ErrorResponse(this.chatErrMsg, 400)
            const isOrderCustomer: Boolean = await AuthService.getInstance().verifyIfUserRequestedIsTheUserConnected(authToken, order.customer)
            if (!isOrderCustomer) throw new ErrorResponse("You're not allowed to view this chat", 403)
        } else if (userRole === Roles.DeliveryMan.toString()) {
            if (!order.deliveryman) throw new ErrorResponse(this.chatErrMsg, 400)
            const isOrderDeliveryman: Boolean = await AuthService.getInstance().verifyIfUserRequestedIsTheUserConnected(authToken, order.deliveryman)
            if (!isOrderDeliveryman) throw new ErrorResponse("You're not allowed to view this chat", 403)
        }
    }

    async getOrderChat (orderId: string, authToken: string): Promise<ChatDocument[]> {
        const order: OrderDocument = await OrderModel.findById(orderId).exec()
        const user: UserDocument = await UserModel.findOne({
            session: authToken
        }).exec()

        if (order.status !== "onTheWay") throw new ErrorResponse(this.chatErrMsg, 400)
        await this.verifyUserInChat(authToken, user.role, order)

        return await ChatModel.find({
            order: orderId
        }).exec()
    }

    async sendInOrderChat (orderId: string, authToken: string, message: string) {
        const order: OrderDocument = await OrderModel.findById(orderId).exec()
        const user: UserDocument = await UserModel.findOne({
            session: authToken
        }).exec()

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