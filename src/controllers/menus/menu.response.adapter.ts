
export class MenuResponseAdapter {
    static adapt(menu: any) {
        let linkToProduct: String[] = [];
        const restaurant = menu.restaurant ? "http://localhost:3001/restaurant/" + menu.restaurant : "";
        if(menu.products.length > 0){
            menu.products.forEach((product: any) => {
                linkToProduct.push("http://localhost:3001/product/" + product.toString())
            })
        }

        return {
            name: menu.name,
            amount: menu.amount,
            restaurant: restaurant,
            products: linkToProduct,
            status: menu.status
        };
    }
}