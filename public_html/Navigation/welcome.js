/**
 * The global part of this script is run immediately after this script is loaded
 * If you dont need to use any dependency or the view doesnt have any other script, you can write your logic here.
 */

/**
 * View Loaded Event
 * 
 * This event is fired when all the scripts related to the view is loaded
 * Writing your logic here is safer
 * 
 * @param {type} args -> view loading arguments
 */
Events.AddListener("Welcome.Load", function(args)
{
    $("#helloTable").html("");

    if (args == null || args.last !== "Hello")
        $("#helloTable").append(Templates.Row("Hello"));
    if (args == null || args.last !== "World")
        $("#helloTable").append(Templates.Row("World"));

    $(".clickMe").click(function()
    {
        Navigator.Navigate("Big", {text: $(this).html()});
    });
});

/**
 * View Unloading Event
 * This event is fired just before the next view starts loading
 * So you can save any data or make some garbage collection, if you have modified other parts than the "main" part of the page
 */
Events.AddListener("Welcome.Unload", function()
{
});
