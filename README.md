NavigatorJS
=

**NavigatorJS** is a simple single page application framework, designed for using in mobile HTML5 applications.

It provides a **View** template with *main*, *styles*, *scripts* and *templates*. Also there is a *data* field.

Note About Examples
----------
You should have an index.html with this main structure:

    <html>
        <head>
            <title>NavigatorJS</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
            <div id="main">
            </div>
        </body>
    
        <script src="js/jquery.js"></script>
        <script src="js/handlebars.min.js"></script>
        <script src="js/Navigator.js"></script>
    
        <script>
            Navigator.LoadViews("Navigation", ["welcome", "big", "loading"]);
            Navigator.LoadingView = "loading";
            Navigator.Navigate("Welcome");
        </script>
    </html>

NavigatorJS depends on jQuery and HandlebarsJS, download them from their sites or from the examples included in this repository.

    Navigator.LoadViews("Navigation", ["welcome", "big", "loading"]);

This row means that Navigator's root path is *Navigation*, which it will search for *welcome.html, big.html, loading.html* and load the Views from those files.

    Navigator.LoadingView = "loading";

This row means that Navigator should show the *loading* View while Navigating, which means loading scripts and styles.

    Navigator.Navigate("Welcome");

This row simply orders Navigator to load the Welcome view provided by one of the files above (*welcome.html*), thus starting the application.

>When using the examples below, remember to put the **hello.html** in the root directory, in case of this example, *Navigation*.
>Other scripts and stylesheets are relative to **index.html**

Main Field
----------

The **Main** field contains static HTML design. The **Main** field directly overwrites whatever on the main viewport of the application.

A very basic **View** is below:

**hello.html**

    <#MAIN>
    <b>Hello World!</b>
    <!#>

This sample only contains the Main field, which means when Navigated to, the View will display a static HTML page, without any dynamic content.

>*Navigator Fields are written between <#FIELD> - <\!#> tags.*

**Remember** that the **Main** field should consist of only static, plain HTML code, so you mustn't include any script or style code in it.

Styles Field
----------
Okay, with the **Main** field, we can display some good old plain HTML on the viewport. 
But, plain html is usually ugly and very simple. We make our designs pretty by using stlyesheets, but we shouldn't use any style or link tag in our plain HTML code, so how do we load stylesheets?

With the **Styles** field of course!
The **Styles** field lets you dynamically link CSS files with your view, so when Navigated to the view, every css you need will be linked immediately.

**hello.html**

    <#MAIN>
    <b>Hello World!</b>
    <!#>
    
    <#STYLES>
    styles/hello.css
    <!#>
    
**styles/hello.css**

    body
    {
        background-color: lightslategrey;
        font-family: "Segoe UI", Frutiger, "Frutiger Linotype", "Dejavu Sans", "Helvetica Neue", Arial, sans-serif;
    }
   
**That's it!** Now you can write simple, isolated CSS for solely this View, without mixing any other View's styles.
    
Scripts Field
----------
Scripts field is very much alike with the Styles field, linking JavaScript files with your view.
Every js file will be included and ran immediately after loading them when the View is navigated.

**hello.html**

    <#MAIN>
    <b>Hello World!</b>
    <!#>
    
    <#SCRIPTS>
    scripts/hello.js
    <!#>
    
**scripts/hello.js**
    
    alert("Dynamically Loaded JavaScript!");
    
This is a very simple example but the point is clear. When navigated to the hello view, a message box with caption *Dynamically Loaded JavaScript!* will be shown.

>Note:
>When your View loads a single JavaScript document, the above example is completely safe.
>But, if your View depends on more than one JS document, your logic should run after all the script files are loaded.
>In that case, you should add a listener to the *hello.Load* event, and write your logic in the callback method.
>*hello.Load* => **hello** is the name of your View, **Load** is the event name, so *hello.Load* event is fired when every dependency is loaded.

**example.js**

    Events.AddListener("hello.Load", function(args)
    {
        alert("Dynamically Loaded JavaScript!");
    });
    
This way, you can make sure that your code will not fail because of a missing dependency.
That args argument will be discussed later :)

Templates Field
---------
My favorite web templating engine is [HandlebarsJS][1], and I included it as a pre-requisite in Navigator. 
Simply, writing your mustache/handlebars templates in script tags within this field will let you use those templates without any additional work.
I believe I can demonstrate this on a simple example:

**hello.html**

    <#MAIN>
    <b>Hello World!</b>
    <table id="helloTable">
        <tbody></tbody>
    </table>
    <!#>
    
    <#SCRIPTS>
    scripts/hello.js
    <!#>
    
    <#TEMPLATES>
    <script id="Row" type="text/template">
        <tr>
            <td>
                {{this}}
            </td>
        </tr>
    </script>
    <!#>
    
**scripts/hello.js**

    Events.AddListener("hello.Load", function(args)
    {
        $("#helloTable").html("");
    $("#helloTable").append(Templates.Row("Hello"));
        $("#helloTable").append(Templates.Row("From"));
    $("#helloTable").append(Templates.Row("NavigatorJS"));
    });

Navigator will read and compile the templates for you and assign them to a global Templates variable. 

>Remember that variable will change for every View, so you can have different templates with the same name on different Views.

Data Field
----------
The **Data** field consists of meta data and other info about that View, for configuring Navigator, like the name of the View or the animation preference for the loading, etc. there is no definite limit for it's content, you can access the content of Data field from the global ViewData variable.

"welcome.html":

    <#MAIN>
    <!--Arbitrary HTML Code->
    <!#>
    
    <#DATA>
    {
        "name": "WelcomeNavigator"
    }
    <!#>

This way, we set the name of the View to WelcomeNavigator, instead of welcome.

Much more documentation and examples and features are on the way, stay tuned.

---
>**M. Fatih BAKIR**
>http://www.fatihbakir.net
> Written with [StackEdit](https://stackedit.io/).


  [1]: http://handlebarsjs.com/
