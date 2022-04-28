
import {MenuModel, MenuProps} from "../../models/menus/menu.model";
import {ErrorResponse} from "../../utils";
import {RestaurantService} from "../restaurant.service";



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

    public async createMenu (Menu: MenuWithoutId, authToken: string): Promise<Boolean> {

        const verifyIfRightParameters = await this.verifyMenuMandatory(Menu, authToken)
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
            status: 1
        })
        const newMenu = model.save()
        return !!newMenu;
    }

    private async verifyMenuMandatory(Menu: MenuWithoutId, authToken: string) {

        const restaurant = await RestaurantService.getInstance().getOneRestaurant(Menu.restaurant!);
        const isAdmin = await RestaurantService.getInstance().verifyAdminRestaurant(Menu.restaurant!, authToken);

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

    async updateMenu(body: Partial<MenuProps>, menuId: string, restaurantId: string, authToken: string): Promise<Boolean> {

        if(!menuId){
            return false;
        }

        let updateMenu = await MenuModel.findById(menuId).exec();

        const restaurant = await RestaurantService.getInstance().getOneRestaurant(restaurantId);
        const isAdmin = await RestaurantService.getInstance().verifyAdminRestaurant(restaurant?._id, authToken);

        if (!restaurant || !isAdmin) {
            return false;
        }

        if(!updateMenu){
            return false;
        }

        if(body.amount){
            updateMenu.amount = body.amount;
        }

        if(body.name){
            updateMenu.name = body.name;
        }

        if(body.products){
            updateMenu.products = body.products;
        }
        updateMenu.save()
        return true;
    }
}