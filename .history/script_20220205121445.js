const INPUTS = [ 'id', 'name', 'color', 'display', 'memory', 'battery', 'camera', 'state', 'price', 'rate', 'waranty' ]

function resetData () {
  INPUTS.forEach((input, index) => {
    let elem = $(`#form input[name="${input}"]`)

    elem.val('')
  })
}

$(document).ready(() => {
  let body = $('#body')
  let table = $('#list table').DataTable()

  

  fetchItems(body, table)

  // form add button / save button
  $('body').on('click', 'form button', (e) => {
    e.preventDefault();

    axios.post('/add', $('form').serialize()).then((r) => {
      fetchItems(body, table)
      resetData()
    })
  })


})


function fetchItems (body, table) {
  axios.get('/prices').then((response) => {
    console.log(response)
    let data = response.data
    let html = ''

    table.clear()
    data.forEach((elem, index) => {
      html += elem.html

      const { id, name, color, display, memory, camera, battery, state, price, rate, waranty } = elem.data

      table.row.add([
      name,
      color,
      memory,
      camera,
      display,
      battery,
      state,
      `<tr><td><button data-id="${id}" class="btn">Edit</button></td>
      <td><button class="btn" id="${id}">Delete</button></td><tr>
      <input type="hidden" name="id" value="${id}"/>`
      ]).draw(false)

      addDeleteItemListener(id, elem, table)
      addEditItemListener(id, table)
    })

    $("body").on('click', '#export', () => {
      axios.post('/export', { html: $('#body').html()}).then(r => {
        console.log(r)
      })
      $( "#dialog" ).dialog( "open" );
    })

    $(body).html(html)
  })
}


function addDeleteItemListener (id, elem, table) {
  document.getElementById(id).addEventListener('click', (e) => {
    console.log(e)
    e.preventDefault()
    let element = $(`.tag[data-id="${id}"]`)

    element.remove()
    
    table.row($(e.currentTarget).closest('tr')).remove().draw()
    axios.post('/delete', elem.data)

  })
}

function addEditItemListener (id, table) {
  document.querySelector(`[data-id="${id}"]`).addEventListener('click', (e) => {
    e.preventDefault()

    INPUTS.forEach((input, index) => {
      let elem = $(`#form input[name="${input}"]`)

      axios.post(`/prices/${id}`).then((r) => {
        elem.val(r.data[input])
      })
    })
  })
}

function modalActions () {
  $("#myModal").on("show", function() {    // wire up the OK button to dismiss the modal when shown
    $("#myModal a.btn").on("click", function(e) {
        console.log("button pressed");   // just as an example...
        $("#myModal").modal('hide');     // dismiss the dialog
    });
});
    
$("#myModal").on("hide", function() {    // remove the event listeners when the dialog is dismissed
    $("#myModal a.btn").off("click");
});
        
$("#myModal").on("hidden", function() {  // remove the actual elements from the DOM when fully hidden
    $("#myModal").remove();
});
        
$("#myModal").modal({                    // wire up the actual modal functionality and show the dialog
    "backdrop"  : "static",
    "keyboard"  : true,
    "show"      : true                     // ensure the modal is shown immediately
});
}