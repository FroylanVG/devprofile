const express = require('express');
const { restart } = require('nodemon');
const router = express.Router();
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator/check');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route  GET api/profile/me
//@desc   Get current user profile
//@access Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);
        if(!profile){
            return res.status(400).json({msg: 'There is not profile for this user'})
        }
        res.json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error')
    }
});

// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
router.post('/',[
        auth,[
            check('status', 'Status is required').notEmpty(),
            check('skills', 'Skills is required').notEmpty(),
        ]
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      // destructure the request
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook
        } = req.body;  

        //Build the profile
        const profileFields = {};
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        if(skills){
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }
        profileFields.social = {};
        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (instagram) profileFields.social.instagram = instagram;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (facebook) profileFields.social.facebook = facebook;
        try {
            let profile = await Profile.findOne({user: req.user.id});
            if (profile) {
                //update
                profile = await Profile.findOneAndUpdate(
                    {user: req.user.id},
                    {$set: profileFields}, 
                    {new: true});
                return res.json(profile);
            }
            //Create profile
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error')
        }
        res.send('Hello')
    }
  );

module.exports = router;