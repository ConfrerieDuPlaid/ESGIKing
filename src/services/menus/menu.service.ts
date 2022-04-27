
import {MenuModel, MenuProps} from "../../models/menus/menu.model";
import {ErrorResponse} from "../../utils";


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

    public async createMenu (Menu: MenuWithoutId): Promise<Boolean> {
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
        console.log(model)
        const newMenu = model.save()
        return !!newMenu;
    }
}