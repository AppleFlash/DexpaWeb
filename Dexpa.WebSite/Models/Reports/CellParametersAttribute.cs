using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Dexpa.WebSite.Models.Reports
{
    [AttributeUsage(AttributeTargets.Property)]
    public class CellParametersAttribute:Attribute
    {
        private readonly float cellWidth;
        private readonly int align; //0-left, 1-center, 2-right
        private readonly bool wrap;

        public CellParametersAttribute(float cellWidth, int align, bool wrap)
        {
            this.cellWidth = cellWidth;
            this.align = align;
            this.wrap = wrap;
        }

        public float CellWidth
        {
            get { return this.cellWidth; }
        }

        public int Align
        {
            get { return this.align; }
        }

        public bool Wrap
        {
            get { return this.wrap; }
        }

    }
}