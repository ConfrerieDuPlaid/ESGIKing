import {UserDocument, UserModel} from "../models";
import {ErrorResponse} from "../utils";
import {OrderService} from "./orders/order.service";

export class UserService {

    private static instance: UserService

    public static getInstance(): UserService {
        if (UserService.instance === undefined) {
            UserService.instance = new UserService()
        }
        return UserService.instance
    }

    private constructor() {
    }

    public async getUser(userID: string | undefined): Promise<UserDocument> {
        const user = await UserModel.findById(userID).exec()
        if (user === null) {
            throw new ErrorResponse("This user doesn't exist", 404)
        }
        return user
    }

    public async getUserProp(userID: string | undefined, propName: string): Promise<any> {
        const user: UserDocument = await this.getUser(userID)
        return user.get(propName)
    }

    public async validUserRole (userID: string | undefined, validRoles: string[]): Promise<boolean> {
        const user: UserDocument = await this.getUser(userID)
        return validRoles.indexOf(user.role.toString()) !== -1
    }

    async getOrdersByStatusAndUserId(status: string, userId: string, authToken: string) {
        const order = await OrderService.getInstance().getOrdersByStatusAndUserId(status, userId, authToken);
        return order;
    }
}