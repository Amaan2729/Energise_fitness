const express = require('express');

const router = express.Router();

const Contact = require('../models/contact');

/* =========================
   CREATE CONTACT MESSAGE
========================= */

router.post('/', async (req, res) => {

  try {

    console.log(
      '[contacts] POST /api/contacts body:',
      req.body
    );

    const {

      firstName,
      lastName,
      email,
      phone,
      message

    } = req.body || {};

    /* VALIDATION */

    if (

      !firstName ||
      !email ||
      !message

    ) {

      return res.status(400).json({

        message:
        'firstName, email and message are required'

      });

    }

    /* SAVE CONTACT */

    const contact = new Contact({

      firstName,
      lastName,
      email,
      phone,
      message

    });

    await contact.save();

    console.log(
      '[contacts] ✅ Contact saved:',
      contact._id
    );

    /* =========================
       REAL-TIME NOTIFICATION
    ========================= */

    const io = req.app.get("io");

    if (io) {

      io.emit("notification", {

        type: "contact",

        title: "📩 New Contact Message",

        message:
        `${firstName} ${lastName || ""} sent a message`,

        data: {

          id: contact._id,

          email,

          firstName,

          lastName,

          phone,

          message

        }

      });

      console.log(
        '[notifications] 📢 Contact notification sent'
      );

    }

    /* RESPONSE */

    res.status(201).json({

      message: 'Contact saved',

      id: contact._id

    });

  }

  catch (err) {

    console.error(
      '❌ Contact save error:',
      err
    );

    res.status(500).json({

      message: 'Server error'

    });

  }

});

/* =========================
   GET CONTACTS
========================= */

router.get('/', async (req, res) => {

  try {

    const items = await Contact.find()

    .sort({ createdAt: -1 })

    .limit(200);

    res.json({

      contacts: items

    });

  }

  catch (err) {

    console.error(
      '❌ Error fetching contacts:',
      err
    );

    res.status(500).json({

      message: 'Server error'

    });

  }

});

module.exports = router;