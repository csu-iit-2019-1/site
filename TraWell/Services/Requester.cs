using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;

namespace TraWell.Services
{
    public class Requester
    {
        public static string SendPOST(string Url, string Data)
        {
            System.Net.WebRequest req = System.Net.WebRequest.Create(Url);
            req.Method = "POST";
            req.Timeout = 100000;
            req.ContentType = "application/json; charset=utf-8";
            byte[] sentData = Encoding.ASCII.GetBytes(Data);
            req.ContentLength = sentData.Length;
            try
            {
                System.IO.Stream sendStream = req.GetRequestStream();
                sendStream.Write(sentData, 0, sentData.Length);
                sendStream.Close();
                System.Net.WebResponse res = req.GetResponse();
                System.IO.Stream ReceiveStream = res.GetResponseStream();
                System.IO.StreamReader sr = new System.IO.StreamReader(ReceiveStream, Encoding.UTF8);
                Char[] read = new Char[256];
                int count = sr.Read(read, 0, 256);
                string Out = String.Empty;
                while (count > 0)
                {
                    String str = new String(read, 0, count);
                    Out += str;
                    count = sr.Read(read, 0, 256);
                }
                return Out;
            }
            catch
            {
                return "";
            }
        }

        public static string SendDELETE(string Url)
        {
            System.Net.WebRequest req = System.Net.WebRequest.Create(Url);
            req.Method = "DELETE";
            req.Timeout = 100000;
            System.Net.WebResponse resp = req.GetResponse();
            System.IO.Stream stream = resp.GetResponseStream();
            System.IO.StreamReader sr = new System.IO.StreamReader(stream);
            string Out = sr.ReadToEnd();
            sr.Close();
            return Out;
        }

        public static string SendGET(string Url)
        {
            System.Net.WebRequest req = System.Net.WebRequest.Create(Url);
            try { 
                System.Net.WebResponse resp = req.GetResponse();
                System.IO.Stream stream = resp.GetResponseStream();
                System.IO.StreamReader sr = new System.IO.StreamReader(stream);
                string Out = sr.ReadToEnd();
                sr.Close();
                return Out;
            }
            catch
            {
                return "";
            }
        }
    }
}