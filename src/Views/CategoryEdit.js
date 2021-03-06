import React, {useEffect, useState} from 'react';

import {Link} from "react-router-dom";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import {API, graphqlOperation} from "aws-amplify";
import {listCategorys} from "../graphql/queries";
import {makeStyles} from "@material-ui/core/styles";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import {createCategory, updateCategory} from "../graphql/mutations";
import EditTable from "../Componetns/EditTable";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const initialState = { id:-1,name: ''}


const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        listStyle: 'none',
        padding: theme.spacing(0.5),
        margin: 0,
    },
    chip: {
        margin: theme.spacing(0.5),
        textTransform: 'uppercase',
        fontSize: '25px',
        color: 'grey',
        padding:'5px'
    },
}));
function CategoryEdit() {
    const classes = useStyles();
    const [formState, setFormState] = useState(initialState)
    const [isDlg, setIsDlg] = useState(false)
    const [categories, setCategories] = useState([])
    const [status, setStatus] = React.useState({msg:"", state:0});

    useEffect(() => {
        readCategories()
    }, [])
    async function readCategories() {
        try {
            const result = await API.graphql(graphqlOperation(listCategorys))
            setCategories(result.data.listCategorys.items)
            localStorage.categories=JSON.stringify(result.data.listCategorys.items)
        } catch (err) { console.log('error fetching todos') }
    }
    const handleSubmit= async (event) => {
        event.preventDefault()
        try {
            const input_data = {...formState}
            console.log(input_data)
            let result=await API.graphql(graphqlOperation(updateCategory, {input: input_data}))
            let temp = Object.assign([], categories)
            let index = temp.findIndex(x => x.id == formState.id)
            temp[index]=result.data.updateCategory
            setCategories(temp)

        } catch (err) {
            console.log('error creating todo:', err)
        }
        setIsDlg(false)
    }
    const submitUpdateCategories=async (rows) => {
        setStatus({msg:"Updating these categories to DB", state: 3})
        let s_count=0;
        let o_categories=JSON.parse(localStorage.categories)
        for (const input_data of rows) {
            let index=o_categories.findIndex(x=>x.id==input_data.id)
            if (index==-1)continue
            if (JSON.stringify(o_categories[index])==JSON.stringify(input_data))continue
            try {
                delete input_data.createdAt
                delete input_data.updatedAt
                let result=await API.graphql(graphqlOperation(updateCategory, {input: input_data}))
                let temp = Object.assign([], categories)
                let index = temp.findIndex(x => x.id == formState.id)
                temp[index]=result.data.updateCategory
                setCategories(temp)
                s_count++;
            } catch (err) {
                console.log('error creating todo:', err)
            }
        }

        setStatus({msg:`Updated ${s_count} categories, Total Count:${rows.length-s_count}`, state: 0})
    }
    const getOriginalName=()=>{
        let index=categories.findIndex(x=>x.id===formState.id)
        //console.log(categories,formState,index)
        let res=index>-1?categories[index].name:'Unknow'
        return res
    }
    const editCategory=(data)=>{
        setFormState({id:data.id,name:data.name})
        setIsDlg(true)
    }
    return (
        <div >

            <div>
                <div className={'headline'}>
                    Edit Existing Category
                </div>
                <div style={{display:'flex',justifyContent:'space-around'}}>
                    <div>
                        <Button variant="outlined"
                                component={Link} to={'/'}
                        >
                            Create New Categories
                        </Button>
                    </div>
                    <div>
                        <Button variant="outlined"
                                component={Link} to={'/delete-category'}
                        >
                            Delete Category
                        </Button>
                    </div>
                </div>
            </div>
            <EditTable key={categories.length} rows={categories} handleUpdateRows={submitUpdateCategories} status={status}/>
            {/*<Paper elevation={3} className="mt_20 p20">
                {categories.map((data) => {
                    return (
                        <Chip
                            key={data.id}
                            label={data.name}
                            onClick={()=>{
                                editCategory(data)
                            }}
                            className={classes.chip}
                        />
                    );
                })}
            </Paper>*/}
        </div>
    );
}

export default CategoryEdit;
