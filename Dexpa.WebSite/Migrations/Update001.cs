namespace Dexpa.WebSite.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Update001 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.AspNetUsers", "OldUserName", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.AspNetUsers", "OldUserName");
        }
    }
}
