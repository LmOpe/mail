document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Send mail on submit
  document.querySelector('#compose-form').onsubmit = () => {
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    // send_mail(recipients, subject, body);
    send_mail(recipients, subject, body);
    return false;
  }

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#view-mail').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-mail').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // When user visits their mailbox, populate the mialbox with the appropriate mails
  if (mailbox == 'inbox') {
    populate('inbox');
  }
  else if (mailbox == 'sent') {
    populate('sent');
  }
  else if (mailbox == 'archive') {
    populate('archive');
  }
}


// // Create function to send mail to server
function send_mail(recipients, subject, body) {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
    .then(response => response.json())
    .then(result => {

      // Respond with error or success
      error = result.error;
      success = result.message;
      if (success != null) {
        document.querySelector('#response').innerHTML = success;
        load_mailbox('sent')
      }
      else {
        document.querySelector('#response').innerHTML = error;
      }
    });
}

// send get request to server and use the response appropriately
function populate(mailbox) {
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      console.log(emails);
      emails.forEach((email) => {
        const element = document.createElement('div');
        const sender = document.createElement('b');
        const subject = document.createElement('p');
        const timestamp = document.createElement('p');
        sender.innerHTML = email.sender;
        subject.innerHTML = email.subject;
        timestamp.innerHTML = email.timestamp;
        element.append(sender, subject, timestamp);
        if (email.read) {
          element.style.background = 'gray';
        }
        else {
          element.style.background = 'white';
        }
        element.onclick = () => {
          fetch(`/emails/${email.id}`)
            .then(response => response.json())
            .then(emails => {
              console.log(emails);
              viewEmail(emails);

              // Update the mail to read
              if (email.read == false){
                fetch(`/emails/${email.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                    read: 'True'
                  })
                })
              }
            })
        };
        console.log(element);
        document.querySelector('#emails-view').append(element);
      }
      )
    });
}

// Creates an element that displays the mail information
function viewEmail(emails) {
  const sender = document.createElement('p')
  sender.innerHTML = `<b>From: </b> ${emails.sender}`;
  const recipients = document.createElement('p');
  recipients.innerHTML = `<b>To: </b> ${emails.recipients}`;
  const subject = document.createElement('p');
  subject.innerHTML = `<b>Subject: </b> ${emails.subject}`;
  const timestamp = document.createElement('p');
  timestamp.innerHTML = `<b>Timestamp: </b> ${emails.timestamp}`;
  const body = document.createElement('p');
  body.innerHTML = emails.body;
  const head = document.createElement('div');
  head.append(sender, recipients, subject, timestamp);
  const content = document.createElement('div');
  content.append(body);
  hr = document.createElement('hr');

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-mail').style.display = 'block';
  if (document.querySelector('#view-mail').childElementCount === 0){
    document.querySelector('#view-mail').append(head, hr, content);
  }
  else{
    document.querySelector('#view-mail').replaceChildren(head, hr, content);
  }
}