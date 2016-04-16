using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Dexpa.WebSite.Models.Reports
{
    [AttributeUsage(AttributeTargets.Property)]
    public class TableHeaderTextAttribute : Attribute
    {
        private readonly string header;
        private readonly int colspan;
        private readonly int rowspan;
        private readonly bool mergedRowspan;

        public TableHeaderTextAttribute(string header, int colspan, int rowspan, bool mergedRowspan = false)
        {
            this.header = header;
            this.colspan = colspan;
            this.rowspan = rowspan;
            this.mergedRowspan = mergedRowspan;
        }

        public string Header
        {
            get { return this.header; }
        }

        public int Colspan
        {
            get { return this.colspan; }
        }

        public int Rowspan
        {
            get { return this.rowspan; }
        }

        public bool MergedRowspan
        {
            get { return this.mergedRowspan;}
        }
    }
}