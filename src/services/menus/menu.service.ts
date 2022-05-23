
import {MenuDocument, MenuModel, MenuProps} from "../../models/menus/menu.model";
import {ErrorResponse} from "../../utils";
import {RestaurantService} from "../restaurant.service";
import {RestaurantModel} from "../../models";
import {AuthService} from "../auth.service";
import {Status} from "./menu.status";
import {StaffService} from "../staff.service";



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

    public async getMenu (menuId: string, authToken: string): Promise<MenuDocument | null> {
        const menu: MenuDocument | null = await MenuModel.findById(menuId).exec()
        if (menu === null) {
            throw new ErrorResponse("Menu not found", 404)
        }

        const userId: string = await AuthService.getInstance().getUserIdByAuthToken(authToken)
        const isInRestaurant: boolean = await StaffService.getInstance().userIsAssignedToRestaurant(userId)
        if(!isInRestaurant) throw new ErrorResponse("You can't access this resource", 406)

        return menu
    }

    public async deactivateMenu (menuId: string, authToken: string): Promise<boolean> {
        const menu: MenuDocument | null = await this.getMenu(menuId, authToken)
        if (menu === null) {
            throw new ErrorResponse("Menu not found", 404)
        }

        const isAdmin = await RestaurantService.getInstance().verifyStaffRestaurant(menu.restaurant!, authToken);
        if(!isAdmin) return false

        menu.status = Status[0]
        await menu.save()
        return true
    }

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
        if (Menu.spotlight) model.spotlight = Menu.spotlight

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

        if (menu.spotlight) {
            updateMenu.spotlight = menu.spotlight
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

        if (!isAdmin) {
            return false;
        }
        let isFalse = 0;
        Menu.products!.forEach(elm => {
            if (!restaurant.products!.includes(elm)) {
                isFalse = 1;
                return;
            }
        })
        if (isFalse == 1) {
            return false;
        }

        return true;
    }

    async getAllMenu(orderParam: string | undefined): Promise<MenuProps[]> {
        const desc = -1
        let order: any = [['spotlight', desc]]
        if (orderParam && orderParam === "none") {
            order = []
        }
        return await MenuModel.find().sort(order).exec();
    }

    async getMenuByRestaurantId(restaurantId: string, orderParam: string | undefined) {
        const desc = -1
        let order: any = [['spotlight', desc]]
        if (orderParam && orderParam === "none") {
            order = []
        }
        return await MenuModel.find({restaurant: restaurantId}).sort(order).exec();
    }
}