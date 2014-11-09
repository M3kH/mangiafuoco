MangiaFuoco
==========
Is the fictional director and puppet master of the Great '[Marionette](http://www.marionettejs.com)' Theatre.
Basically a App manager with a loader for: views, model and collection;

**PROTOTYPE - NOT USE IN PRODUCTION**

## Install & Use it
```
bower install git@github.com:M3kH/mangiafuoco.git
```
## The concept
We are JavaScript Lover, and fan of Backbone world.
From the beginning of my experience in js frameworks, I notice my self think and rethink almost same problems.
MangiaFuoco is like an orchestra tool for solve them.

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