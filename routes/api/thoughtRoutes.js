const router = require('express').Router();
const { User, Thought } = require('../../models');

router.get('/', (req, res) => {
    Thought.find()
        .then(thoughts => res.json(thoughts))
        .catch(err => {
            res.json(err)
            console.log(err)
        })
})


router.post('/', (req, res) => 
    Thought.create(req.body)
        .then(thought => {
            console.log(req.body)
            User.findByIdAndUpdate(req.body.userId ,
                {
                   $addToSet: { thoughts: thought._id }
                },
                { new: true }
            ).then((user) =>
                    !user
                        ? res.status(404).json({ message: 'No user with that ID, but thought was created' })
                        : res.json(user)

            ).catch((err) => res.status(500).json(err));
        })
)

module.exports = router;