
import {OrderDocument, OrderModel, OrderProps} from "../../models/orders/order.model";
import {ErrorResponse} from "../../utils";
import {RestaurantService} from "../restaurant.service";
import {ReductionService} from "../reduction.service";
import {ProductModel} from "../../models/product/mongoose.product.model";
import {OrderStatus} from "./order.status";
import {ReductionModel, ReductionProps} from "../../models/reduction.model";
import {MenuModel} from "../../models/menus/menu.model";



type OrderWithoutId = Partial<OrderProps>

export class OrderService {

    private static instance: OrderService

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

        const amoutOfOrder = await OrderService.computeOrderAmount(Order);

        const model = new OrderModel({
            restaurant: Order.restaurant,
            menus: Order.menus,
            reductionId: Order.reductionId,
            products: Order.products,
            amount: amoutOfOrder,
            status: OrderStatus[0]
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

        let productIsInTheRestaurant = true;
        Order.products!.forEach(elm => {
            if(!restaurant.products!.includes(elm)){
                productIsInTheRestaurant = false;
                return ;
            }
        })


        let menuIsInTheRestaurant = true;
        Order.menus!.forEach(elm => {
            if(!restaurant.menus!.includes(elm)){
                menuIsInTheRestaurant = false;
                return ;
            }
        })
        return productIsInTheRestaurant && menuIsInTheRestaurant;

    }


    private static async computeOrderAmount(Order: OrderWithoutId) {
        let amount = 0;
        let reduction = null;
        let price;
        for (const elm of Order.products!) {
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

        for (const elm of Order.menus!) {
            const menu = await MenuModel.findById(elm)
            if(menu)
                amount += menu.amount;
        }

        return amount;


    }

    async getOrdersByRestaurantIdAndStatus(restaurantId: string, authToken: string, status: string) : Promise<OrderDocument[]> {
        const isAdmin = await RestaurantService.getInstance().verifyStaffRestaurant(restaurantId, authToken, "OrderPicker")
        if(isAdmin)
            return await OrderModel.find({
                restaurant: restaurantId,
                status: status
            });

        throw new ErrorResponse("you're not a staff member of this restaurant", 403);
    }

    async updateOrder(orderId: string, newStatus: string , authToken: string): Promise<Boolean> {
        const order = await OrderModel.findOne({_id: orderId}).exec();
        if(!order)
            return false;

        const isOrderPicker = await RestaurantService.getInstance().verifyStaffRestaurant(order.restaurant, authToken, "OrderPicker");
        if(isOrderPicker && newStatus == "inProgress" && order.status == "created"){
            order.status = newStatus;
            return await order.save() !== null;
        }
        return false
    }
}