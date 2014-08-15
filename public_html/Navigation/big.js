/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
Events.AddListener("Big.Load", function(args)
{
    $("#holder").html(Templates.Template(args));

    $(".backBtn").click(function()
    {
        Navigator.Navigate("Welcome", {last: args.text});
    });
});