MangiaFuoco
==========
Is the fictional director and puppet master of the Great '[Marionette](http://www.marionettejs.com)' Theatre.
Basically a App manager with a loader for: views, model and collection;

## Install & Use it
```
bower install git@github.com:M3kH/mangiafuoco.git
```
## What is Mangiafuoco?
We are JavaScript Lover, and fan of Backbone world.
But from the beginning of our experience in js frameworks, we notice some repetitive task/code which can be easy avoid in a declarative way.

**MangiaFuoco** is like an orchestra tool for solve them, simply provide a *loader* ~  based on top of **RequireJS**, he can *extend* objects, and can even *initialize* them.

*MF* define for you a default **non~opinionated** directory structure, which is possible to customize:

```
 -- app/
 -------- js/
 ----------- collections/
 ----------- components/
 ----------- models/
 ----------- views/
```

Another concept introduce in *MF*, are [Web Components](http://webcomponents.org/).

With *Web Components*, we think them can be wrote has the developer prefer, but because, we don't believe in full functional components which can be contain duplication of code, we think them into our FrameWork contest.

But how the component structure looks?

```
 -- ComponentName/
 -------- collections/
 -------- models/
 -------- views/
 -------- index.js // this contain the instructions for route to the constructor usually a view.
```

That's why is good idea for default export the MF initizialization under the **app** global variable.


## Ok cool, but how I can use it?
First important thing, is *MF* dependencies.

- [RequireJS](http://www.requirejs.org)
- [BackBone](http://www.backbonejs.org)
- [Marionette](http://www.marionettejs.org)

Then you have to define your `app` name space into your `RequireJS` configuration which can look like:

```javascript
        define('app', ['mf'], function(mf){
            return window.app = window.app ? window.app : new MF({
                paths:{
                    main: 'sample-project/js/'
                }
            });
        });
```

Start to load your models, collections, components and views:

### Load Model / Collection
```javascript
// This would look into models/ModelName.js but it would be return without be initialize
app.load({model: 'ModelName'}); 
// Collection
app.load({collection: 'CollectionName'});

// This return an instance of.
app.load({model: 'ModelName', data: {name: 'Hello World!'}});

// Equivalent with type:
app.load({type:'model', name: 'ModelName', data: {name: 'Hello World!'}});

// Extend before return
app.load({collection: 'CollectionName', extend: { hasValue: function(){ return this.value ? true : false}}});
```

### Load a View / Component
```javascript
app.load({view: 'ViewName', el: '#someSelector'}); 

app.load({component: 'ComponentName', el: '#someSelector', data: {name: 'Hello World!'}});
```

## What can I do with it?

- **Multipage logic integration**

 We immediately notice that framework are to much focused in a Single Page App logics.
And unfortunately in most of my working cases, we can't develop in just one page.
MangiaFuoco try to provide a good abstraction for make easy the re-usage of the code and the execution of the js with or without DOM.

- **Consolidated Folder Structure**

 Another frustration during our framework experience, they doesn't define your folder structure. MangiaFuoco does.
Almost all JS Framework deliver a non-opinionated folder structure. But the price of this freedom, is payed on the learning time.
Tired of learning or thinking every-time a folder structure, MangiaFuoco try to solve this problem with consolidate it.

- **Web Component**

 Web Components are new way 'prototyped' view of thinking for distributing web logics.

 With the reusability has a goal. I try to consolidate those logic of what a component is, and deliver the responsibility in the right way.
In this way we could share components from project to project, with the ambition to make an component package manager.

- **Extend another project**

 Another common of the Framework is they don't provide file loading structure, or if they provide them, they try to stay close has much
has possible from the name space, without providing any additional functionalities.

 From the nature of MangiaFuoco, he depends from RequireJS or CommonJS deps. We try to abstract more on that level and consider different
scenarios, and we want get the possibility of extend entire other project.

## The big picture
For guarantee a good level of abstraction and reduce the has much has possible the setup task. We are delivering MangiaFuoco in the most common way Backbone Apps works.

But still MF wants change radically the way we work with JS framework, and MF it self isn't enough for get an optimal environment where you can just start to develop.

Additional to this repo we still have to develop other parts/tools:

- An Yeo Man Generator
- A Grunt-Task for compile the assets/js
- A Grunt-Task for download and install MF.component trough bower
- A webpage to list the avaiable components

... And more ...