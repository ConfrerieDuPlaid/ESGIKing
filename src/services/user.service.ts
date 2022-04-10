import {UserDocument, UserModel} from "../models";
import {ErrorResponse} from "../utils";

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

    public async userIsAssignedToRestaurant (userID: string): Promise<boolean> {
        const user = await UserModel.findById(userID).exec()
        return !!user.restaurant
    }

    public async getUser (userID: string): Promise<UserDocument> {
        const user = await UserModel.findById(userID).exec()
        if (user === null) {
            throw new ErrorResponse("This user doesn't exist", 404)
        }
        return user
    }
}