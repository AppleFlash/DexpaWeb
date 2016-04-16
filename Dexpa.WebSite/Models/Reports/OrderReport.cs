using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;

namespace Dexpa.WebSite.Models.Reports
{
    public class OrderReport
    {
        //public long Id { get; set; }
        [TableHeaderText("Месяц", 0, 0), CellParameters(50f, 0, false)]
        public string Date { get; set; }

        [TableHeaderText("Прибыль", 0, 0), CellParameters(50f, 2, false)]
        public double Profit { get; set; }

        [TableHeaderText("Аренда", 0, 0), CellParameters(50f, 2, false)]
        public double Rent { get; set; }

        [TableHeaderText("Тех. поддержка", 0, 0), CellParameters(50f, 2, false)]
        public double TechSupport { get; set; }

        [TableHeaderText("Процент", 0, 0), CellParameters(50f, 2, false)]
        public double Percent { get; set; }

        [TableHeaderText("Сумма по таксометру", 0, 0), CellParameters(50f, 2, false)]
        public double TaxometrAmount { get; set; }

        [TableHeaderText("Число заказов", 0, 0), CellParameters(50f, 2, false)]
        public int AllOrders { get; set; }

        [TableHeaderText("Яндекс", 0, 0), CellParameters(50f, 2, false)]
        public int Yandex { get; set; }

        //public DateTime Timestamp { get; set; }
    }
}