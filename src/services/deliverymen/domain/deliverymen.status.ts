export enum DeliverymenStatus {
    available = 'available',
    delivering = 'delivering'
}


export function getDeliverymanStatusFromString(str: string): DeliverymenStatus {
    switch (str) {
        case 'available': return DeliverymenStatus.available;
        case 'delivering': return DeliverymenStatus.delivering;
        default: throw new Error("Unknown deliveryman status");
    }
}
