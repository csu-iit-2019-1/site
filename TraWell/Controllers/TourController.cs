using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TraWell.Services;

namespace TraWell.Controllers
{
    public class TourController : Controller
    {
        // GET: Tour
        public ActionResult Index(int? siteId)
        {
            if (siteId != null) ViewBag.siteId = siteId;
            return View();
        }

        public JsonResult Book()
        {
            Stream req = Request.InputStream;
            req.Seek(0, System.IO.SeekOrigin.Begin);
            string json = new StreamReader(req).ReadToEnd();
            var s = Requester.SendPostWaitStatus("http://localhost:4044/api/booking/", json);
            var a = "";
            if (s == 200) a = "ok";
            else a = "bad";
            return Json(a, JsonRequestBehavior.AllowGet);
        }
    }
}