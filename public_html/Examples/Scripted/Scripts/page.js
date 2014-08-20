var page;

page.Load = function(args)
{
    setTimeout(function() {
        Navigator.Navigate("styled");
    }, 2000);
}