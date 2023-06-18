let cl = console.log;
let baseUrl = `https://crud-api-json-default-rtdb.asia-southeast1.firebasedatabase.app/`;
let postsUrl = `${baseUrl}posts.json`

const postsContainer = document.getElementById('postsContainer');
const formContainer = document.getElementById('formContainer');
const titleControl = document.getElementById('title');
const contentControl = document.getElementById('content');
const addPostBtn = document.getElementById('addPostBtn');
const updateBtn = document.getElementById('updateBtn');
const cancelBtn = document.getElementById('cancelBtn');
const loader = document.getElementById('loader');


const postsTemp = (arr) => {
    let result = '';
    arr.forEach(ele => {
        postsContainer.innerHTML = result +=
            `
            <div class="card my-5" id="${ele.id}">
                <div class="card-header">
                    <h3>${ele.title}</h3>
                </div>
                <div class="card-body">
                    <p>${ele.body}</p>
                </div>
                <div class="card-footer d-flex justify-content-between">
                <button type="button" class="btn btn-primary" onclick="onEditHandler(this)">Edit</button>
                <button type="button" class="btn btn-danger" onclick="onDeleteHandler(this)">Delete</button>
                </div>
            </div>
        `
    });
}


const makeApiCall = (methodName, apiUrl, bodyMsg) => {
    return fetch(apiUrl, {
        method: methodName,
        body: JSON.stringify(bodyMsg),
        headers: {
            "Autharazation": "Bearer Token",
            "content-type": "application/json; charset=UTF-8"
        }
    })
        .then((res) => {
            return res.json()
        })
}

makeApiCall("GET", postsUrl)
    .then((res) => {

        let data = [];
        for (const key in res) {
            let obj = {
                id: key,
                ...res[key]
            }
            data.push(obj)
        }
        postsTemp(data)
        Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Posts Api is Success',
            showConfirmButton: true,
            timer: 2000
        })
    })
    .catch((err) => {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: err,
            timer: 3000
        })
    })
    .finally(() => {
        loader.classList.add('d-none')
    })


formContainer.addEventListener('submit', (e) => {
    e.preventDefault();
    let obj = {
        title: titleControl.value,
        body: contentControl.value
    }
    makeApiCall("POST", postsUrl, obj)
        .then((res) => {
            let card = document.createElement('div');
            card.className = `card my-5`;
            card.id = res.name
            let result =
                `
                <div class="card-header">
                    <h3>${obj.title}</h3>
                </div>
                <div class="card-body">
                    <p>${obj.body}</p>
                </div>
                <div class="card-footer d-flex justify-content-between">
                    <button type="button" class="btn btn-primary" onclick="onEditHandler(this)">Edit</button>
                    <button type="button" class="btn btn-danger" onclick="onDeleteHandler(this)">Delete</button>     
                </div>
            `
            card.innerHTML = result;
            postsContainer.append(card)
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Posts is Successfully Create',
                showConfirmButton: true,
                timer: 2000
            })
        })
        .catch((err) => {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: err,
                timer: 3000
            })
        })
        .finally(() => {
            e.target.reset()
            loader.classList.add('d-none')
        })

})

const onEditHandler = (e) => {
    let editId = e.closest('.card').getAttribute('id')
    localStorage.setItem('edit', editId);
    let editUrl = `${baseUrl}posts/${editId}.json`

    makeApiCall("GET", editUrl)
        .then((res) => {
            titleControl.value = res.title
            contentControl.value = res.body
        })
        .catch((err) => {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: err,
                timer: 3000
            })
        })
        .finally(() => {
            addPostBtn.classList.add('d-none')
            updateBtn.classList.remove('d-none')
            loader.classList.add('d-none')
        })
}

updateBtn.addEventListener('click', (e) => {
    let data = {
        title: titleControl.value,
        body: contentControl.value
    }
    let updateId = localStorage.getItem('edit');
    localStorage.removeItem('edit')
    let updateUrl = `${baseUrl}posts/${updateId}.json`

    makeApiCall('PATCH', updateUrl, data)
        .then((res) => {
            const updateID = [...document.getElementById(updateId).children]
            updateID[0].innerHTML = `<h3>${data.title}</h3>`
            updateID[1].innerHTML = `<p>${data.body}</p>`
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Posts is Successfully Updated!!!',
                showConfirmButton: true,
                timer: 2000
            })
        })
        .catch((err) => {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: err,
                timer: 3000
            })
        })
        .finally(() => {
            formContainer.reset();
            addPostBtn.classList.remove('d-none')
            updateBtn.classList.add('d-none')
            loader.classList.add('d-none')
        })
})

const onDeleteHandler = (e) => {
    let deleteId = e.closest('.card').id
    let deleteUrl = `${baseUrl}posts/${deleteId}.json`
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't to delete this post!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'Deleted!',
                'Your file has been deleted.',
                'success',
                makeApiCall('DELETE', deleteUrl)
                    .then((res) => {

                        const deleteID = document.getElementById(deleteId)
                        deleteID.remove()
                    })
                    .catch((err) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: err,
                            timer: 3000
                        })
                    })
                    .finally(() => {
                        loader.classList.add('d-none')
                    })
            )
        } else {
            return;
        }
    })


}

cancelBtn.addEventListener('click', (e) => {
    formContainer.reset()
    updateBtn.classList.add('d-none')
    addPostBtn.classList.remove('d-none')
})