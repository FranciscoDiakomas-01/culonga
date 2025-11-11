<div className="flex gap-1">
  <span
    className="h-6 w-6 rounded-full flex justify-center items-center text-md font-bold"
    style={{
      backgroundColor: checkout?.btn.bgColor,
      color: checkout?.btn.textColor,
    }}
  >
    2
  </span>
  <p>Dados de Pagamento</p>
</div>

{/* Aqui está a parte corrigida dos métodos de pagamento */}
<div className={`grid ${
  myPayments.length >= 2 && "md:grid-cols-2"
}  gap-5`}>
  {myPayments
    .sort((a, b) => {
      // Garante que o método Express (id: 1) sempre seja o último
      if (a === 1) return 1;
      if (b === 1) return -1;
      return 0;
    })
    .map((item, index) => {
      const pay = PaymentServices.find((p) => {
        return p.id == item;
      });

      return (
        <button
          key={index}
          type="button"
          className="border-2 border-gray-100 cursor-pointer w-full transition-all rounded-lg p-3 flex flex-col items-center justify-center space-y-2"
          style={{
            borderColor:
              activePayment == item
                ? `${checkout.btn.bgColor}10`
                : ``,
            backgroundColor:
              activePayment == item
                ? `${checkout.btn.bgColor}10`
                : "",
          }}
          onClick={() => {
            setACtivePayments(item);
          }}
        >
          <img
            src={pay?.image}
            alt={pay?.title}
            className="w-20 h-10 object-contain"
          />
          <span className="text-sm font-medium">
            {pay?.title}
          </span>
        </button>
      );
    })}
</div>