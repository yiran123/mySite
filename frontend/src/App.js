import React from 'react';
import './App.css';


class App extends React.Component {
  constructor(props) {
    super(props); 
    this.state = {
      todoList:[],
      activeItem:{
        id:null,
        title:'',
        completed: false,
      },
      editing:false
    }
    this.fetchTasks = this.fetchTasks.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.getCookie = this.getCookie.bind(this)
    this.deleteItem = this.deleteItem.bind(this)
    this.strikeUnstrike = this.strikeUnstrike.bind(this)

    
  }

  getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
  }

  componentWillMount() {
    this.fetchTasks();

  }

  fetchTasks() {
    console.log('Fetchting');
    fetch('http://localhost:8000/api/task-list/')
    .then(response => response.json())
    .then(data =>
      this.setState({todoList:data})
      )
  }

  handleChange(e) {
    var name = e.target.name;
    var value = e.target.value;
    this.setState({
      activeItem: {
        ...this.state.activeItem,
        title:value
      }
    })

  }

  deleteItem(task) {
    var csrfToken = this.getCookie('csrftoken');
    var url = `http://localhost:8000/api/task-delete/${task.id}/`

    fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-type':'application/json',
        'X-CSRFToken':csrfToken,
      },
    }).then((response)=> {
      this.fetchTasks();

    })
  }

  handleSubmit(e) {
    e.preventDefault();

    var csrfToken = this.getCookie('csrftoken');
    var url = 'http://localhost:8000/api/task-create/';
    var urlMethod = 'POST';

    if(this.state.editing == true ) {
      url = `http://localhost:8000/api/task-update/${this.state.activeItem.id}/`
      urlMethod = 'PUT'
      this.setState({
        editing: false
      })

    }
    fetch(url, {
      method: urlMethod,
      headers:{
        'Content-type':'application/json',
        'X-CSRFToken':csrfToken,

      },
      body:JSON.stringify(this.state.activeItem)
    }).then((response)=> {
        this.fetchTasks()
        this.setState({
          activeItem:{
        id:null,
        title:'',
        completed: false,
      }
        })
    }).catch(function(error) {
      console.log(error)
    })
  }

  startEdit(task) {
    this.setState({
      activeItem: task,
      editing: true,
    })
  }

  strikeUnstrike(task) {
    task.completed = !task.completed
    var csrfToken = this.getCookie('csrftoken');
    var url = `http://localhost:8000/api/task-update/${task.id}/`
    var urlMethod = 'PUT'
        fetch(url, {
      method: urlMethod,
      headers:{
        'Content-type':'application/json',
        'X-CSRFToken':csrfToken,

      },
      body:JSON.stringify(task)
    }).then(()=> {
        this.fetchTasks()
    })

  }

  render() {
    var tasks = this.state.todoList
    var self = this
    return (
      <div className="container">
        <div id="task-container">
          <div id="form-wrapper">
            <form onSubmit={this.handleSubmit} id="form">
              <div className="flex-wrapper">
                <div style={{flex: 6}}>
                  <input onChange={this.handleChange} className="form-control" id="title" value={this.state.activeItem.title} type="text" name="title" placeholder="Add task" />
                </div>
             
                <div style={{flex: 1}}>
                  <input id="submit" className="btn btn-warning" type="submit" name="Add" />
                </div>
              </div>
          </form>
        </div>
      
        <div id="list-wrapper">
          {tasks.map(function(task, index) {
          return(
            <div key={index} className="task-wrapper flex-wrapper">
              <div onClick={()=>self.strikeUnstrike(task)} style={{flex: 7}}>
                {task.completed == false ? (
                  <span>{task.title}</span>

                  ) : ( 
                    <strike> {task.title}</strike>
                  )
                }
              </div>
              <div style={{flex: 1}}>
                <button onClick={()=>self.startEdit(task)} className="btn btn-sm btn-outline-info">Edit </button>
              </div>
              <div style={{flex: 1}}>
                <button onClick={()=>self.deleteItem(task)} className="btn btn-sm btn-outline-dark delete">- </button>
              </div>
            </div>
          )
        })}
        </div> 
      </div>
    </div>
    )
  }
}

export default App;
