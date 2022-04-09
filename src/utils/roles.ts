export enum Roles {
    "BigBoss",
    "Admin", 
    "Customer", 
    "OrderPicker", 
    "DeliveryMan"
}

export namespace Roles {
    export function toString(role: Roles): string {
        return Roles[role];
    }

    export function fromString(dir: string): Roles {
        return (Roles as any)[dir];
    }
}