const router = require('express').Router();
const { User, Thought } = require('../../models');

router.get('/', (req, res) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => {
            res.json(err)
            console.log(err)
        })
})

router.post('/', (req, res) => {
    User.create(req.body)
        .then(user => res.json(user))
        .catch(err => {
            res.json(err)
            console.log(err)
        })
})

router.get('/:userId', (req, res) => {
    User.findOne({ _id: req.params.userId })
        .populate('thoughts')
        .populate('friends')
        .then((user) =>
            !user
                ? res.status(404).json({ message: 'No user with that ID' })
                : res.json(user)
        )
        .catch((err) => res.status(500).json(err));
})

// BONUS: when user deleted, the user's associated thoughts will be removed as well
router.delete('/:userId', (req, res) => {
    User.findByIdAndDelete(req.params.userId)
        .then((user) =>
            !user
            ? res.status(404).json({ message: 'No user with that ID' })
            : Thought.deleteMany( {username : user.username }
                ).then( thoughts =>
                    res.json({ message: `User deleted and their ${thoughts.deletedCount} thoughts found and deleted` })
                )
        )
        .catch((err) => res.status(500).json(err));
})


router.put('/:userId', (req, res) => {
    User.findOneAndUpdate(
        { _id: req.params.userId },
        { $set: req.body },
        { runValidators: true, new: false }
      )
        .then(user => {
          if( !user ) {
            res.status(404).json({ message: 'No user with this id!' })
          } else {
            // when username is updated, update their Thought's username value.
            if ( user.username !== req.body.username) {
                Thought.updateMany(
                    { username : user.username },
                    { $set : {username: req.body.username} }
                ).then( thoughts => {
                    res.json({ message: `${user.username} has changed to ${req.body.username}, and their thought(${thoughts.modifiedCount})'s username has been changed`});
                }).catch((err) => res.status(500).json(err));   
            }
            else {
                res.json({ message: `User information updated`})
            }
          }
        })
        .catch((err) => res.status(500).json(err));
})

// add a new friend to a user's friend list
router.post('/:userId/friends/:friendId', (req, res) => {
    User.findOneAndUpdate(
        { _id: req.params.userId },
        { $addToSet: { friends: req.params.friendId } },
        { runValidators: true, new: true}
      ).then((user) =>
      !user
        ? res.status(404).json({ message: 'No user found what the id' })
        : res.json(user)
    )
    .catch((err) => res.status(500).json(err));
})

// remove a friend from a user's friend list
router.delete('/:userId/friends/:friendId', (req, res) => {
    User.findOneAndUpdate(
        { _id: req.params.userId },
        { $pull: { friends: req.params.friendId } },
        { runValidators: true, new: true }
      ).then((user) =>
      !user
        ? res.status(404).json({ message: 'No user found what the id' })
        : res.json(user)
    )
    .catch((err) => res.status(500).json(err));
})


module.exports = router;
