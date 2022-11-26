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

router.get('/:thoughtId', (req, res) => {
    Thought.findOne({ _id: req.params.thoughtId })
        .then((thought) =>
            !thought
                ? res.status(404).json({ message: 'No thought with that ID' })
                : res.json(thought)
        )
        .catch((err) => res.status(500).json(err));
})

// when create a new thought, the user's document is also updated adding the thought_id to thoughts 
router.post('/', (req, res) => 
    Thought.create(req.body)
        .then(thought => {
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

router.put('/:thoughtId', (req, res) => {
    Thought.findOneAndUpdate(
        { _id: req.params.thoughtId },
        { $set: req.body },
        { runValidators: true, new: true }
      )
        .then((thought) =>
          !thought
            ? res.status(404).json({ message: 'No thought with this id!' })
            : res.json(thought)
        )
        .catch((err) => {
          console.log(err);
          res.status(500).json(err);
        });
})

router.delete('/:thoughtId', (req, res) => {
    Thought.findOneAndRemove({ _id: req.params.thoughtId })
    .then( thought =>
      !thought
        ? res.status(404).json({ message: 'No thought with this id!' })
        : User.findOneAndUpdate(
            { thoughts: req.params.thoughtId },
            { $pull: { thoughts: req.params.thoughtId  } },
            { new: true }
          ).then(user => 
            !user 
                ? res.status(404).json({message: 'The thought was deleted, but No user id found who has the thought'})
                : res.json(user))
    )
    .catch((err) => res.status(500).json(err));
})
module.exports = router;