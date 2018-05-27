import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  withMobileDialog,
} from 'material-ui/Dialog';

const styles = theme =>({
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 400,
  },
  numField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  multilineField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 400,
  },
});

class BubbleDialog extends React.Component {

	render() {
      const { fullScreen } = this.props;
      const { classes, bubble } = this.props;
      const { formOpen, handleFormClose, handleFormChange, handleFormCoordChange } = this.props;
      const { title } = this.props;
      return (
      	<Dialog
          fullScreen={fullScreen}
          open={formOpen}
          onClose={handleFormClose}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">{title}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {bubble.title}, [{bubble.coord[0]},{bubble.coord[1]}]<br/>
              {bubble.situation}
            </DialogContentText>
            <TextField
		          id="title"
		          label="Title"
		          className={classes.textField}
		          value={bubble.title}
		          onChange={//can't use ()=>... here
		          	handleFormChange('title')}
		          margin="normal"
		        />
		        <TextField
		          id="date"
		          label="Date"
		          className={classes.textField}
		          value={bubble.date}
		          onChange={handleFormChange('date')}
		          margin="normal"
		        />
		        <TextField
		          id="coord_0"
		          label="Pleasure"
		          value={bubble.coord[0]}
		          onChange={handleFormCoordChange(0)}
		          type="number"
		          className={classes.textField}
		          InputLabelProps={{
		            shrink: true,
		          }}
		          margin="normal"
		        />
		        <TextField
		          id="coord_1"
		          label="Arousal"
		          value={bubble.coord[1]}
		          onChange={handleFormCoordChange(1)}
		          type="number"
		          className={classes.textField}
		          InputLabelProps={{
		            shrink: true,
		          }}
		          margin="normal"
		        />
		        <TextField
		          id="situation"
		          label="Situation"
		          multiline
		          value={bubble.situation}
		          onChange={handleFormChange('situation')}
		          className={classes.multilineField}
		          margin="normal"
		        />
		        <TextField
		          id="thoughts"
		          label="Thoughts"
		          multiline
		          value={bubble.thoughts}
		          onChange={handleFormChange('thoughts')}
		          className={classes.multilineField}
		          margin="normal"
		        />
		        <TextField
		          id="feelings"
		          label="Feelings"
		          multiline
		          value={bubble.feelings}
		          onChange={handleFormChange('feelings')}
		          className={classes.multilineField}
		          margin="normal"
		        />
          </DialogContent>
          <DialogActions>
            <Button onClick={
            	//https://stackoverflow.com/questions/48497358/reactjs-maximum-update-depth-exceeded-error/48497410
              //that because you calling toggle inside the render method which will cause to re-render 
              //and toggle will call again and re-rendering again and so on
              //not onChange?
            	() => handleFormClose('cancel')
            } color="primary">
              Cancel
            </Button>
            <Button onClick={() => handleFormClose('add')} color="primary" autoFocus>
              Add
            </Button>
          </DialogActions>
        </Dialog>
      );
    }  
}

BubbleDialog.propTypes = {
  fullScreen: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired, //to support withStyles
};
//https://stackoverflow.com/questions/45704681/react-material-ui-export-multiple-higher-order-components
BubbleDialog = withStyles(styles)(BubbleDialog);
export default withMobileDialog()(BubbleDialog);