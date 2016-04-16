using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Dexpa.WebSite.Models.Reports
{
    public class DriverReport
    {
        [TableHeaderText("Условия работы",0,2),CellParameters(30f,0,false)]
        public string DriverWorkConditions { get; set; }

        [TableHeaderText("Позывной", 0, 2),CellParameters(15f, 0, false)]
        public string DriverCallsign { get; set; }

        [TableHeaderText("ФИО", 0, 2), CellParameters(95f, 0, false)]
        public string DriverName { get; set; }

        [TableHeaderText("Сумма", 0, 2), CellParameters(20f, 2, false)]
        public double Amount { get; set; }

        [TableHeaderText("Процент", 0, 2), CellParameters(20f, 2, false)]
        public double Percent { get; set; }

        [TableHeaderText("Аренда", 0, 2), CellParameters(20f, 2, false)]
        public double Rent { get; set; }

        [TableHeaderText("Долг", 0, 2), CellParameters(20f, 2, false)]
        public double Debt { get; set; }

        [TableHeaderText("Тех. поддержка", 0, 2), CellParameters(20f, 2, false)]
        public double TechSupport { get; set; }

        [TableHeaderText("Сумма по таксометру", 0, 2), CellParameters(20f, 2, false)]
        public double TaxometrAmount { get; set; }

        [TableHeaderText("Заказы", 4, 0), CellParameters(20f, 2, false)]
        public object Orders { get; set; }

        [TableHeaderText("Всего", 0, 0, true), CellParameters(20f, 2, false)]
        public int AllOrders { get; set; }

        [TableHeaderText("Выполнено", 0, 0, true), CellParameters(20f, 2, false)]
        public int DoneOrders { get; set; }

        [TableHeaderText("Отменено клиентом", 0, 0, true), CellParameters(20f, 2, false)]
        public int ClientCanceled { get; set; }

        [TableHeaderText("Отменено водителем", 0, 0, true), CellParameters(20f, 2, false)]
        public int DriverCanceled { get; set; }

        [TableHeaderText("Рейтинг", 0, 2), CellParameters(20f, 2, false)]
        public int Rating { get; set; }

        [TableHeaderText("Средняя оценка", 0, 2), CellParameters(20f, 2, false)]
        public int AverageRating { get; set; }

        [TableHeaderText("Доля хороших треков", 0, 2), CellParameters(20f, 2, false)]
        public int PartGoodTrack { get; set; }
    }
}