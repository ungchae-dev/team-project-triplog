async function requestPayments() {  /*상품설정 및 결제창 연동*/
    const item = {
        id: "acorn_100",
        name: "도토리 100개",
        price: 10000,
    }

    const paymentId = crypto.randomUUID();

    const payment = await PortOne.requestPayment({
        storeId: "store-4e640aa5-588e-43a9-acf5-ebaeff70b074",
        channelKey: "channel-key-8c3e9cfb-a553-471c-bea5-148c3270fea1",
        paymentId: paymentId,
        orderName: item.name,
        totalAmount: item.price,
        currency: "CURRENCY_KRW",
        payMethod: "EASY_PAY",
        customData: {
            item: item.id
        }
    });

    console.log("결제 응답:", payment);


    alert("도토리가 충전되었습니다!");

}