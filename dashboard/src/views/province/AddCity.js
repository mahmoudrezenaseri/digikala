import React, { useState, useEffect } from 'react';
import {
    CButton,
    CRow,
    CForm,
    CCol
} from '@coreui/react';
import { toast } from 'react-toastify';
import { Formik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import classes from './css/add-province.module.css';

import CustomCard from '../../components/card/customCard/custom-card.component'
import SubmitButton from '../../components/button/submit-button.component';
import InputWithLabel from '../../components/input/input-with-label.component';
import CancelButton from '../../components/button/cancel-button.component';
import SwitchWithLabel from '../../components/input/switch-with-label.component';
import Select2WithLabel from '../../components/input/select2-with-label.component';

const schema = yup.object().shape({
    fname: yup.string().max(150, 'عنوان فارسی باید حداکثر دارای 150 کاراکتر باشد').required('لطفا عنوان فارسی را وارد کنید'),
    ename: yup.string().max(150, 'عنوان انگلیسی باید حداکثر دارای 150 کاراکتر باشد'),
    code: yup.string().max(5, 'کد استان باید حداکثر دارای 5 کاراکتر باشد')
});

const AddProvince = (props) => {
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState([]);

    useEffect(() => {
        getAllProvince()
    }, []);

    const handleSubmiting = (values, setSubmitting, resetForm) => {

        axios({
            url: "/",
            method: "post",
            data: {
                query: `
                mutation addCity($provinceId:ID!,$fname:String!,$ename:String,$code:String,$active:Boolean){
                    createCity(input:{provinceId:$provinceId,fname:$fname,ename:$ename,code:$code,active:$active}){
                        status,
                        message
                    }
                  }`,
                variables: {
                    "fname": values.fname,
                    "ename": values.ename,
                    "code": values.code,
                    "active": values.active,
                    "provinceId": values.province,
                }
            }
        }).then((response) => {
            if (response.data.errors) {
                const { message } = response.data.errors[0];
                toast.error(message);
                setLoading(false);
                setSubmitting(false);
            }
            else { // success
                toast.success(response.data.data.createCity.message)
                setLoading(false);
                setSubmitting(false);
                resetForm()
            }
        }).catch((error) => {
            toast.error(global.config.message.error.fa);
            setLoading(false);
            setSubmitting(false);
        });
    }

    const getAllProvince = () => {
        axios({
            url: "/",
            method: "post",
            data: {
                query: `
                  query{
                    getAllProvince {
                        _id,
                        fname
                    }
                  } 
                `
            }
        }).then((response) => {
            if (response.data.errors) {
                const { message } = response.data.errors[0];
                toast.error(message);
            }
            else { // success
                const defaultItem = [{ value: "null", label: "انتخاب کنید" }];
                const provinces = prepareProvinceOptions(response.data.data.getAllProvince)
                setOptions([...defaultItem, ...provinces])
            }
        }).catch((error) => {
            toast.error(global.config.message.error.fa);
        });
    }

    function prepareProvinceOptions(provinces) {
        let newArray = [];
        for (let index = 0; index < provinces.length; index++) { // لوپ در دسته بندی های بدون والد
            const element = provinces[index];
            newArray.push({ "value": element._id, "label": element.fname }); // افزودن آنها به آرایه جدید
        }

        return newArray
    }

    return (
        <div className="animated fadeIn">
            <CustomCard title="افزودن شهر">
                <div key="card-header-buttons"></div>
                <div key="card-body">
                    <Formik
                        initialValues={{ fname: '', ename: '', code: '', active: true, province: '' }}
                        validationSchema={schema}
                        onSubmit={(values, { setSubmitting, resetForm }) => {
                            setLoading(true);
                            handleSubmiting(values, setSubmitting, resetForm);
                        }} >
                        {({
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            isSubmitting,
                            setFieldValue,
                            resetForm
                        }) => (
                            <CForm onSubmit={handleSubmit}>
                                <CRow>
                                    <CCol sm="4">
                                        <InputWithLabel
                                            label="عنوان فارسی"
                                            type="text"
                                            name="fname"
                                            lang="fa"
                                            required={true}
                                            placeholder="عنوان فارسی را وارد کنید"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.fname}
                                            errorsInput={errors.fname}
                                            touchedInput={touched.fname} />
                                    </CCol>
                                    <CCol sm="4">
                                        <InputWithLabel
                                            label="عنوان انگلیسی"
                                            type="text"
                                            name="ename"
                                            lang="en"
                                            required={false}
                                            placeholder="عنوان انگلیسی را وارد کنید"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.ename}
                                            errorsInput={errors.ename}
                                            touchedInput={touched.ename} />
                                    </CCol>
                                    <CCol sm="4">
                                        <Select2WithLabel
                                            required
                                            name="province"
                                            label="استان"
                                            value={values.province}
                                            onChange={e => setFieldValue("province", e.value)}
                                            options={options}
                                            errorsInput={errors.province}
                                            touchedInput={touched.province}
                                        />
                                    </CCol>
                                    <CCol sm="4">
                                        <InputWithLabel
                                            label="کد شهر"
                                            type="text"
                                            name="code"
                                            maxlength="5"
                                            letterSize="cap"
                                            placeholder="کد شهر را وارد کنید"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.code}
                                            errorsInput={errors.code}
                                            touchedInput={touched.code} />
                                    </CCol>
                                    <CCol sn="4">
                                        <SwitchWithLabel
                                            name="active"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.active}
                                            errorsInput={errors.active}
                                            touchedInput={touched.active} />
                                    </CCol>
                                </CRow>
                                <hr />
                                <CRow>
                                    <CCol md="12">
                                        <SubmitButton loading={loading} inputText="ثبت" disabled={isSubmitting} />
                                        <CancelButton onClick={() => { resetForm(); }} />
                                    </CCol>
                                </CRow>
                            </CForm>
                        )}
                    </Formik>
                </div>
            </CustomCard>
        </div>
    )
}

export default AddProvince;