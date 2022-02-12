$(document).ready(() => {
  let elements = $('.tag')
  let list = $('#list table tbody')
  let body = $('#body')

  let table = $('#list table').DataTable()

  fetchItems(body, table)


  $('body').on('click', 'form button', (e) => {
    e.preventDefault();

    axios.post('/add', $('form').serialize()).then((r) => {
      fetchItems(body, table)
    })
  })
})


function addDeleteItemListener (id, table) {
  document.getElementById(id).addEventListener('click', (e) => {
    console.log(e)
    e.preventDefault()
    let element = $(`.tag[data-id="${id}"]`)

    element.remove()

    table.row($(this).parents('tr')).remove().draw()
    axios.post('/delete', elem.data)

  })
}

function addEditItemListener (id, table) {
  document.querySelector(`[data-id="${id}"]`).addEventListener('click', (e) => {
    e.preventDefault()
    let element = $(`.tag[data-id="${id}"]`)
    let inputs = [ 'name', 'color', 'display', 'memory', 'batter', 'camera', 'state', 'price', 'rate', 'waranty' ]

    inputs.forEach((input, index) => {
      let elem = $(`#form input[name="${input}"]`)

      axios.post(`/prices/${id}`).then((r) => {
        elem.val(r[input])
      })
    })



  })
}

function fetchItems (body, table) {
  axios.get('/prices').then((response) => {
    console.log(response)
    let data = response.data
    let html = ''

    table.clear()
    data.forEach((elem, index) => {
      html += elem.html

      const { id, name, color, display, memory, camera, battery, state, price, rate, waranty } = elem.data

      console.log(table)
      table.row.add([
      name,
      color,
      memory,
      camera,
      display,
      battery,
      state,
      `<tr><td><button data-id="${id}">Edit</button></td>
      <td><button id="${id}">Delete</button></td><tr>`,
      `<input type="hidden" value="${id}"/>`
      ]).draw(false)

      addDeleteItemListener(id, table)
      addEditItemListener(id, table)
    })

    $("body").on('click', '#export', () => {
      axios.post('/export', { html: $('#body').html()}).then(r => console.log(r))
    })

    $(body).html(html)
  })
}