---
layout: default
title: React tutorial
---

<style>
  code {
    font-size: small;
  }
</style>


# ReactJS tutorial in ki

The `index.html` page:

    <html>
      <head>
        <title>Hello React</title>
        <script src="http://fb.me/react-0.8.0.js"></script>
        <script src="http://code.jquery.com/jquery-1.10.0.min.js"></script>
        <script src="mori.js"></script>
      </head>
      <body>
        <div id="content"></div>
        <script src="react_ki.out.js"></script>
      </body>
    </html>

A few macros for writing React components concisely using s-expressions instead of JSX 

    ki macro (defcomp $name $render_body) 
             (def $name ((js React.createClass) 
                         {$ 'render' (fn [] $render_body)}))
                         
    ki macro (defcomp $name {$kv ...} $render_body) 
             (def $name ((js React.createClass) 
                         {$kv ... 'render' (fn [] $render_body)}))
                                             
    ki macro (dom $tag {$kv ...} $children ...)
             ((js React.DOM.$tag) {$kv ...} $children ...)
                                                       
    ki macro (dom $tag $children ...)
             ((js React.DOM.$tag) (js {}) $children ...)

Tutorial code starts here. A few things to note:

* the CommentBox component just does a fake async request using setTimeout
* state is stored in a persistent data structure within React state in CommentBox

In a more elaborate version global state could be moved to an atom using atom callbacks to trigger a re-rendering.

    ki require core
    
    ki (do
    
     (def data [{:author "Pete Hunt" :text "This is one comment"}
                {:author "Jordan Walke" :text "This is another comment"}])
    
     (defcomp Comment
      (dom div {$ :className 'comment'} 
       (dom h2 {$ :className 'commentAuthor'} this.props.author) 
       this.props.children))
    
     (defcomp CommentList
      (dom div {$ :className 'commentList'} 
       (clj_to_js 
        (map (fn [comment i] 
              (Comment {$ :author (get comment :author)} (get comment :text))) 
         this.props.data))))
    
     (defcomp CommentForm
      {$ :handleSubmit 
          (fn []
           (letv [author (js this.refs.author.getDOMNode().value.trim())
                  text (js this.refs.text.getDOMNode().value.trim())]
            (this.props.onCommentSubmit {:author author :text text})
            (js this.refs.author.getDOMNode().value = '')
            (js this.refs.text.getDOMNode().value = '')
            false))}
      (dom form {$ :className 'commentForm' :onSubmit this.handleSubmit} 
       (dom input {$ :type 'text' :placeholder 'Your name' :ref 'author'})
       (dom input {$ :type 'text' :placeholder 'Say something...' :ref 'text'})
       (dom input {$ :type 'submit' :value 'Post'})))
    
     (defcomp CommentBox 
      {$ :getInitialState
          (fn [] 
           {$ :data [{:author "Pete Hunt" :text "This is one comment"}]})
         :componentWillMount 
          (fn [] 
           (setTimeout (fnth [] (this.setState {$ :data data})) 1000))
         :handleCommentSubmit 
          (fn [comment] 
           (this.setState {$ data (conj this.state.data comment)}))}
      (dom div {$ :className 'commentBox'} 
       (dom h1 'Comments') 
       (CommentList {$ :data this.state.data}) 
       (CommentForm {$ :onCommentSubmit this.handleCommentSubmit})))
    
     (React.renderComponent (CommentBox) (document.getElementById 'content'))
    )

