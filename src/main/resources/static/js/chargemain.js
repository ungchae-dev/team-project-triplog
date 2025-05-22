const IMP = window.IMP;
IMP.init("imp03763428");

const button = document.querySelector("button");

const onClickPay = async () => {
    IMP.request_pay({
        pg : "tosspayments",
        pay_method : "card",
        amout : "1000",
        name : "도토리 10개"
    });
};

button.addEventListener("click", onClickPay);