using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Dexpa.WebSite.Models.Reports
{
    public class OrganizationOrderReport
    {
        [TableHeaderText("№ Заказа", 0, 0), CellParameters(20f, 0, false)]
        public long OrderId { get; set; }

        [TableHeaderText("Юр. лицо", 0, 0), CellParameters(50f, 1, false)]
        public string OrganizationName { get; set; }

        [TableHeaderText("Дата заказа", 0, 0), CellParameters(20f, 1, false)]
        public string OrderDate { get; set; }

        [TableHeaderText("Время заказа", 0, 0), CellParameters(20f, 1, false)]
        public string OrderTime { get; set; }

        [TableHeaderText("Сумма по таксометру", 0, 0), CellParameters(20f, 2, false)]
        public double TaxometrAmount { get; set; }

        [TableHeaderText("Тариф", 0, 0), CellParameters(25f, 0, false)]
        public string TariffName { get; set; }

        public OrderState OrderState { get; set; }

        [TableHeaderText("Статус заказа", 0, 0), CellParameters(20f, 0, false)]
        public string OrderStateName { get; set; }

        [TableHeaderText("Номер СЛИПа", 0, 0), CellParameters(20f, 0, false)]
        public string SlipNumber { get; set; }

        [TableHeaderText("Кто создал", 0, 0), CellParameters(20f, 0, false)]
        public string Creator { get; set; }

        [TableHeaderText("Заказчик", 0, 0), CellParameters(20f, 0, false)]
        public string Customer { get; set; }

        [TableHeaderText("Пассажир", 0, 0), CellParameters(20f, 0, false)]
        public string Passenger { get; set; }

        [TableHeaderText("Адрес подачи", 0, 0), CellParameters(80f, 0, false)]
        public string FromAddress { get; set; }

        [TableHeaderText("Адрес назначения", 0, 0), CellParameters(80f, 0, false)]
        public string ToAddress { get; set; }

        [TableHeaderText("Водитель", 0, 0), CellParameters(80f, 0, false)]
        public string Driver { get; set; }

        [TableHeaderText("Автомобиль", 0, 0), CellParameters(30f, 0, false)]
        public string Car { get; set; }

        [TableHeaderText("Гос. номер", 0, 0), CellParameters(25f, 0, false)]
        public string CarNumber { get; set; }

        [TableHeaderText("Примечание", 0, 0), CellParameters(30f, 0, false)]
        public string Comment { get; set; }
    }
}