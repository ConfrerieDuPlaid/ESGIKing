
import {OrderModel, OrderProps} from "../../models/orders/order.model";
import {ErrorResponse} from "../../utils";
import {RestaurantService} from "../restaurant.service";
import {ReductionService} from "../reduction.service";
import {ProductModel} from "../../models/product/mongoose.product.model";



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

    public async createOrder (Order: OrderWithoutId): Promise<Boolean> {

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
            status: 1
        })

        const newOrder = model.save()
        return !!newOrder;
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

        let productIsInTheRestaurant = 1;
        Order.products!.forEach(elm => {
            if(!restaurant.products!.includes(elm)){
                productIsInTheRestaurant = 0;
                return ;
            }
        })

        return productIsInTheRestaurant != 0;

    }


    private static async computeOrderAmount(Order: OrderWithoutId) {
        let amount = 0;
        for (const elm of Order.products!) {
            const product = await ProductModel.findById(elm)
            amount += product.price;
        }
        console.log(amount);
        return amount;
    }
}