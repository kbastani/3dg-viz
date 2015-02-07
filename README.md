# 3dg-viz

A WebGL distributed graph visualization library.

## About

This project was created to provide a WebGL-based distributed visualization interface designed specifically for graphs. The purpose of the project is to first support GraphML uploads of the [NodeXL](http://nodexlgraphgallery.org/Pages/AboutNodeXL.aspx) graph library. There will be a translation library built in that will parse results from other property graph formats to GraphML.

  What does distributed visualization mean?

Distributed graph visualization is a term I made up to describe the process of a client-based messaging approach utilizing a consumer and producer model. The basic idea is that a Web Worker architecture is used to asynchronously send and receive messages to an application-based broker that renders a 3D scene in a distributed way.

## Graph formats

This library is being built out to specifications for [NodeXL Graph Gallery](http://nodexlgraphgallery.org/Pages/Default.aspx), founded by [@marc_smith](http://www.twitter.com/marc_smith).

You can download GraphML exports of NodeXL submissions from the bottom of a GraphML page. For example:

  http://nodexlgraphgallery.org/Pages/Graph.aspx?graphID=39219#cphBody_fvFormView_usrGraphML_divGraphML

## License

Licensed under the Apache License, Version 2.0


