
import {MenuModel, MenuProps} from "../../models/menus/menu.model";
import {ErrorResponse} from "../../utils";
import {RestaurantService} from "../restaurant.service";
import {RestaurantModel} from "../../models";
import {AuthService} from "../auth.service";
import {Status} from "./menu.status";



type MenuWithoutId = Partial<MenuProps>

export class MenuService {

    private static instance: MenuService


    public static getInstance (): MenuService {
        if (MenuService.instance === undefined) {
            MenuService.instance = new MenuService()
        }
        return MenuService.instance
    }

    private constructor() { }

    public async createMenu (Menu: MenuWithoutId, authToken: string): Promise<MenuProps | Boolean> {

        const verifyIfRightParameters = await this.verificationOnMenu(Menu, authToken)
        if(!verifyIfRightParameters) {
            return false;
        }

        if (!Menu.name) {
            throw new ErrorResponse("You have to specify a name for the menu", 400)
        }

        const model = new MenuModel({
            name: Menu.name,
            restaurant: Menu.restaurant,
            products: Menu.products,
            amount: Menu.amount,
            status: Status[1],
        })

        const newMenu = await model.save()
        if(newMenu){
            const restaurant = await RestaurantModel.findById(Menu.restaurant!).exec();
            restaurant.menus = newMenu._id;
            restaurant.save();
            return newMenu
        }else {
            return false;
        }
    }

    private async verificationOnMenu(Menu: MenuWithoutId, authToken: string) {

        const restaurant = await RestaurantService.getInstance().getOneRestaurant(Menu.restaurant!);
        const isAdmin = await RestaurantService.getInstance().verifyStaffRestaurant(Menu.restaurant!, authToken);


        if (!restaurant) {
            return false;
        }

        if(!isAdmin){
            return false;
        }

        let productIsInTheRestaurant = true;
        Menu.products!.forEach(productId => {
            if(!restaurant.products!.includes(productId)){
                productIsInTheRestaurant = false;
                return ;
            }
        })

        return productIsInTheRestaurant;


    }

    async updateMenu(menu: Partial<MenuProps>, menuId: string, restaurantId: string, authToken: string): Promise<Boolean> {

        if(!menuId){
            return false;
        }

        let updateMenu = await MenuModel.findById(menuId).exec();

        if(!updateMenu){
            return false;
        }

        const isvalid = await this.verifyMenuMandatory({
            name: menu.name,
            restaurant: restaurantId,
            products: menu.products,
            amount: +menu!.amount!
        },  authToken);
        if(!isvalid){
            throw new ErrorResponse("Wrong request", 400);
        }

        if(menu.amount && menu.amount > 0){
            updateMenu.amount = menu.amount;
        }

        if(menu.name){
            updateMenu.name = menu.name;
        }

        if(menu.products && menu.products.length > 0){
            updateMenu.products = menu.products;
        }
        updateMenu.save()
        return true;
    }
    private async verifyMenuMandatory(Menu: MenuWithoutId, authToken: string) {

        const restaurant = await RestaurantService.getInstance().getOneRestaurant(Menu.restaurant!);
        const isAdmin = await RestaurantService.getInstance().verifyStaffRestaurant(Menu.restaurant!, authToken);


        if (!restaurant) {
            return false;
        }

        if(!isAdmin){
            return false;
        }
        let isFalse = 0;
        Menu.products!.forEach(elm => {
            if(!restaurant.products!.includes(elm)){
                isFalse = 1;
                return ;
            }
        })
        if(isFalse == 1){
            return false;
        }

        return true;
    }
}