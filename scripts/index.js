import React from 'react';
var data = [
  {id: 1, author: "Pete Hunt", text: "This is one comment"},
  {id: 2, author: "Jordan Walker", text: "This is *another* comment"}
];

var CommentBox = React.createClass({
  getInitialState: function () {
    return {data: []};
  },

  loadComments: function () {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function (data) {
        this.setState({data: data});
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  handleCommentSubmit: function (c) {
    c.id = Date.now();
    var newComments = this.state.data.concat([c]);
    this.setState({data: newComments});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: c,
      success: function (data) {
        this.setState({data: data});
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  componentDidMount: function () {
    this.loadComments();
    setInterval(this.loadComments, this.props.loadInterval);
  },

  render: function () {
    return (
        <div className="commentBox">
          <h1>Comment Box</h1>
          <CommentList data={this.state.data}/>
          <CommentForm onCommentSubmit={this.handleCommentSubmit}/>
        </div>
    );
  }
});

var Comment = React.createClass({
  raw: function () {
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return {__html: rawMarkup};
  },

  render: function () {
    return (
        <div className="comment">
          <h3 className="commentAuthor"> {this.props.author} </h3>
          <span dangerouslySetInnerHTML={this.raw()}/>
        </div>
    );
  }
});

var CommentList = React.createClass({
  render: function () {
    var comments = this.props.data.map(function (c) {
      return (
          <Comment author={c.author} key={c.id}>
            {c.text}
          </Comment>
      );
    });
    return (
        <div className="commentList">
          {comments}
        </div>
    );
  }
});

var CommentForm = React.createClass({
  handleSubmit: function (e) {
    e.preventDefault();
    var author = this.state.author.trim();
    var text = this.state.text.trim();
    if (!text || !author) {
      //bad input
      return;
    }

    this.props.onCommentSubmit({author: author, text: text});
    this.setState({author: '', text: ''});
    return;
  },
  getInitialState: function() {
    return {author: '', text: ''};
  },
  handleAuthorChange: function(e) {
    this.setState({author: e.target.value});
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },

  render: function () {
    return (
        <form className="commentForm" onSubmit={this.handleSubmit}>
          <input type="text" placeholder="Name" value={this.state.author} onChange={this.handleAuthorChange} />
          <input type="textarea" placeholder="Comment..." value={this.state.text} onChange={this.handleTextChange} />
          <input type="submit" value="Post"/>
        </form>
    )
  }
});

React.render(
    <CommentBox url="/api/comments" loadInterval={1000}/>,
    document.body
);