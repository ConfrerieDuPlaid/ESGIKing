import {OrderDocument, OrderModel, OrderProps} from "../../models/orders/order.model";
import {ErrorResponse} from "../../utils";
import {RestaurantService} from "../restaurant.service";
import {ReductionService} from "../reduction.service";
import {ProductModel} from "../../models/product/mongoose.product.model";
import {OrderStatus} from "./order.status";
import {ReductionModel} from "../../models/reduction.model";
import {MenuModel} from "../../models/menus/menu.model";
import {AuthService} from "../auth.service";
import {DeliverymenService} from "../deliverymen/deliverymen.service";
import {DeliverymenStatus} from "../deliverymen/domain/deliverymen.status";


type OrderWithoutId = Omit<OrderProps, "_id">

export class OrderService {

    private static instance: OrderService

    public static getInstance (): OrderService {
        if (OrderService.instance === undefined) {
            OrderService.instance = new OrderService()
        }
        return OrderService.instance
    }

    private deliverymenService = DeliverymenService.getInstance();

    public async createOrder (order: OrderWithoutId): Promise<OrderProps> {

        await this.verifyOrder(order);
        const amountOfOrder = await OrderService.computeOrderAmount(order);
        const isAddressInOrder = order.address !== undefined;
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

    private async verifyOrder(order: OrderWithoutId): Promise<void> | never {

        const restaurant = await RestaurantService.getInstance().getOneRestaurant(order.restaurant!);
        if (!restaurant) throw new ErrorResponse(`Restaurant ${order.restaurant} not found.`, 404)

        if (!order.products && !order.menus) {
            throw new ErrorResponse("Empty order", 412)
        }

        if(order.reductionId){
            const reduction = await ReductionService.getInstance().getReductionById(order.reductionId);
            if(reduction.restaurant !== restaurant?._id.toString() || reduction.status === 0){
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
            console.log(order.menus)
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
        }

        return amount;


    }

    async getOrdersByRestaurantIdAndStatus(restaurantId: string, authToken: string, status: string) : Promise<OrderDocument[]> {
        const isAdmin = await RestaurantService.getInstance().verifyStaffRestaurant(restaurantId, authToken, "OrderPicker")
        if(isAdmin)
            return OrderModel.find({
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

    async updateOrder(orderId: string, newStatus: string | undefined , authToken: string): Promise<OrderDocument> {
        const order: OrderDocument = await OrderModel.findOne({_id: orderId}).exec();
        if(!order) throw new ErrorResponse(`Order ${orderId} not found.`, 404);
        if(!newStatus) return order;
        if(!this.isStatusNextFromCurrentStatus(newStatus, order.status))
            throw new ErrorResponse(`Cannot change status from ${order.status} to ${newStatus}.`, 422);
        const isOrderPicker = await RestaurantService.getInstance().verifyStaffRestaurant(order.restaurant, authToken, "OrderPicker");
        if(isOrderPicker && this.isStatusNextFromCurrentStatus(newStatus, order.status)){
            if (newStatus === "onTheWay" && !order.address) throw new ErrorResponse("Order can't be delivered", 400)
            order.status = newStatus;
        }
        return await order.save();
    }

    private dispatchOrderStatusChanged(order: OrderDocument): void {
        //
    }

    isStatusNextFromCurrentStatus(newOrderStatus: string, currentOrderStatus: string): Boolean{
        const oldToNextStatus: { [oldStatus:string]: string[] } = {
            "created" : ["inProgress"] ,
            "inProgress": ["done", "onTheWay"],
        };

        return oldToNextStatus[currentOrderStatus].includes(newOrderStatus);
    }
}
