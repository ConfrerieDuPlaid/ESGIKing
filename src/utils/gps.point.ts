export class GpsPoint {
    longitude: number;
    latitude: number;

    constructor(longitude: number, latitude: number) {
        this.longitude = longitude;
        this.latitude = latitude;
    }

    public distanceTo(destination: GpsPoint): number {
        return Math.sqrt(this.squareDistanceTo(destination));
    }

    public squareDistanceTo(destination: GpsPoint): number {
        // (x-x')^2 + (y-y')^2
        const origin = this;
        const latitudeDiff = (origin.latitude - destination.latitude);
        const longitudeDiff = (origin.longitude - destination.longitude);
        return latitudeDiff*latitudeDiff + longitudeDiff*longitudeDiff;
    }
}
