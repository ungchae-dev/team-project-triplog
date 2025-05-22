async function requestPay() {
    const item = {
        id: "acorn_100",
        name: "도토리 100개",
        price: 10000,
        currency: "KRW"
    }

    const paymentId = crypto.randomUUID();

    const payment = await PortOne.requestPayment({
        storeId: "tosstest",
        channelKey: "channel-key-8c3e9cfb-a553-471c-bea5-148c3270fea1",
        paymentId: paymentId,
        orderName: item.name,
        totalAmount: item.price,
        currency: item.currency,
        payMethod: "EASY_PAY",
        customData: {
            item: item.id
        }
    });

    if (payment.code !== undefined) {
        alert("결제 실패: " + payment.message);
        return;
    }

    const response = await fetch("/api/payment/complete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ paymentId: payment.paymentId })
    });

    if (response.ok) {
        const result = await response.json();
        if (result.status === "PAID") {
            alert(`결제 성공! 도토리 ${result.charged}개가 충전되었습니다.`);
            location.href = "/mypage";
        }
    } else {
        alert("결제 검증 실패");
    }
}
