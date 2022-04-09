import {UserModel} from "../models";

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
}