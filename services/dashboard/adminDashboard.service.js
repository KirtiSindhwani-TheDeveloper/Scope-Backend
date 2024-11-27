
const config=require('../../dbConfig');
const sql=require('mssql');
const { Transaction } = require('mssql2');
module.exports={
    getPartNotInMaster:async function(req,data){

        try{
            var pool=await sql.connect(config);
            var transaction=new sql.Transaction();
            await transaction.begin()
            new sql.Request(transaction);
            brandId=data.brandId
            const locationID=req.location_id;
            const orderType=req?.orderType;
            const approvedBy=req?.approvedBy;
            const timeBand=req?.timeBand;
            let sum=0;
            // const partNotInMasterData=[]
            for(let res of data.dealers){
                dealerId=res.DealerID
                locationId=res.LocationID
                let query=`SELECT COUNT(Yellow_line) as yellow_count FROM Create_order_request_TD001_${dealerId} WHERE 1=1 and yellow_line=1`
                let params=[]
               
                if(locationID){
                    query+=' AND locationID=@locationID';
                    params.push({name:'locationId',value:locationID})
                }else{
                    query+=' AND locationID=@locationId';
                    params.push({name:'locationId',value:locationId})
                }
                if(orderType){
                    query+=' AND orderTye=@orderType';
                    params.push({name:'orderType',value:orderType})
                }
                if(approvedBy){
                    query+=' AND SCSby=@approvedBy'
                    params.push({name:'approvedBy',value:approvedBy})
                }
                if(timeBand){
                    let band=timeBand.toLowerCase();
                    if(band==='today'){
                        query+='AND dateadded =getdate()'; 
                    }
                    else if(band==='yesterday'){
                        query += ' AND dateadded >DATEADD(DAY, -1, GETDATE())';
                    }
                    else if(band==='last week'){
                        query += ' AND dateadded > dateadd(DAY,-7,getdate())';
                    }
                    else{
                        query += ' AND dateadded > dateadd(month,-1,getdate()) ';
                    }
                }

                const request=await pool.request();

                params.forEach(param => {
                    request.input(param.name, param.value);
                });

                const result=await request.query(query);
                sum+=result.recordset[0].yellow_count;
            }
            // console.log("part not in master data ",partNotInMasterData)
            await transaction.commit();
            const partNotInMasterData={
                yellowLineCount:sum
            }
            return partNotInMasterData;
        }
        catch(error){
            console.log("error ",error.message)
            await transaction.rollback();
        }

    },

    getNoOfRequestApproved:async function(req,data) {
        try{
            var pool=await sql.connect(config);
            var transaction=new sql.Transaction();
            await transaction.begin()
            new sql.Request(transaction);
            brandId=data.brandId
            const orderType=req?.orderType;
            const approvedBy=req?.approvedBy;
            const timeBand=req?.timeBand;
            let sum=0;
            const locationID=req.location_id;
            for(let res of data.dealers){
               dealerId=res.DealerID;
               locationId=res.LocationID
               let query=`SELECT COUNT(Current_status) as approved_count FROM Create_Order_Request_TD001_${dealerId} WHERE 1=1 and Current_status='Approve'`
               let params=[]
               if(locationID){
                query+=' AND locationID=@locationID';
                params.push({name:'locationId',value:locationID})
            }else{
                query+=' AND locationID=@locationId';
                params.push({name:'locationId',value:locationId})
            }
            
               if(orderType){
                   query+=' AND orderTye=@orderType';
                   params.push({name:'orderType',value:orderType})
               }
               if(approvedBy){
                   query+=' AND SCSby=@approvedBy'
                   params.push({name:'approvedBy',value:approvedBy})
               }
               if(timeBand){
                   let band=timeBand.toLowerCase();
                   if(band==='today'){
                       query+='AND dateadded =getdate()'; 
                   }
                   else if(band==='yesterday'){
                       query += ' AND dateadded >DATEADD(DAY, -1, GETDATE())';
                   }
                   else if(band==='last week'){
                       query += ' AND dateadded > dateadd(DAY,-7,getdate())';
                   }
                   else{
                       query += ' AND dateadded > dateadd(month,-1,getdate()) ';
                   }
               }
            //    console.log("QUERY ",query)

               const request=await pool.request();

               params.forEach(param => {
                   request.input(param.name, param.value);
               });

               const result=await request.query(query);
              sum+=result.recordset[0].approved_count
            }
           const approvedRequest={
                approvedRequest:sum
           }
            await transaction.commit();
            return approvedRequest;
        }
        catch(error){
            console.log("error ",error.message)
            await transaction.rollback();
        }
    },

    getNoOfRequestPending:async function(req,data){
        try{
            var pool=await sql.connect(config);
            var transaction=new sql.Transaction();
            await transaction.begin()
            new sql.Request(transaction);
            brandId=data.brandId
            const orderType=req?.orderType;
            const approvedBy=req?.approvedBy;
            const timeBand=req?.timeBand;
           let sum=0;
            const locationID=req.location_id;
            for(let res of data.dealers){
               dealerId=res.DealerID;
               locationId=res.LocationID
               let query=`SELECT COUNT(Current_status) as pending_count FROM CreateOrderRequestPending_TD001_${dealerId} WHERE 1=1 and Current_status='Pending'`
               let params=[]
               if(locationID){
                query+=' AND locationID=@locationID';
                params.push({name:'locationId',value:locationID})
            }else{
                query+=' AND locationID=@locationId';
                params.push({name:'locationId',value:locationId})
            }
            
               if(orderType){
                   query+=' AND orderTye=@orderType';
                   params.push({name:'orderType',value:orderType})
               }
               if(approvedBy){
                   query+=' AND SCSby=@approvedBy'
                   params.push({name:'approvedBy',value:approvedBy})
               }
               if(timeBand){
                   let band=timeBand.toLowerCase();
                   if(band==='today'){
                       query+='AND dateadded =getdate()'; 
                   }
                   else if(band==='yesterday'){
                       query += ' AND dateadded >DATEADD(DAY, -1, GETDATE())';
                   }
                   else if(band==='last week'){
                       query += ' AND dateadded > dateadd(DAY,-7,getdate())';
                   }
                   else{
                       query += ' AND dateadded > dateadd(month,-1,getdate()) ';
                   }
               }
            //    console.log("QUERY ",query)

               const request=await pool.request();

               params.forEach(param => {
                   request.input(param.name, param.value);
               });

               const result=await request.query(query);
                sum+=result.recordset[0].pending_count
            }

            const pendingRequest={
                pendingRequestCount:sum
            }
            // console.log("approved request data ",approvedRequest)
            await transaction.commit();
            return pendingRequest;
        }
        catch(error){
            console.log("error ",error.message)
            await transaction.rollback();
        }
    },

    getNoOfRequestRejected:async function(req,data){
        try{
            var pool=await sql.connect(config);
            var transaction=new sql.Transaction();
            await transaction.begin()
            new sql.Request(transaction);
            brandId=data.brandId
            const orderType=req?.orderType;
            const approvedBy=req?.approvedBy;
            const timeBand=req?.timeBand;
            let sum=0;
            const locationID=req.location_id;
            for(let res of data.dealers){
               dealerId=res.DealerID;
               locationId=res.LocationID
               let query=`SELECT COUNT(Current_status) as rejected_count FROM Create_Order_Request_TD001_${dealerId} WHERE 1=1 and Current_status='Decline'`
               let params=[]
               if(locationID){
                query+=' AND locationID=@locationID';
                params.push({name:'locationId',value:locationID})
            }else{
                query+=' AND locationID=@locationId';
                params.push({name:'locationId',value:locationId})
            }
            
               if(orderType){
                   query+=' AND orderTye=@orderType';
                   params.push({name:'orderType',value:orderType})
               }
               if(approvedBy){
                   query+=' AND SCSby=@approvedBy'
                   params.push({name:'approvedBy',value:approvedBy})
               }
               if(timeBand){
                   let band=timeBand.toLowerCase();
                   if(band==='today'){
                       query+='AND dateadded =getdate()'; 
                   }
                   else if(band==='yesterday'){
                       query += ' AND dateadded >DATEADD(DAY, -1, GETDATE())';
                   }
                   else if(band==='last week'){
                       query += ' AND dateadded > dateadd(DAY,-7,getdate())';
                   }
                   else{
                       query += ' AND dateadded > dateadd(month,-1,getdate()) ';
                   }
               }
            //    console.log("QUERY ",query)

               const request=await pool.request();

               params.forEach(param => {
                   request.input(param.name, param.value);
               });

               const result=await request.query(query);
                sum+=result.recordset[0].rejected_count
            }
            const rejectedRequest={
                rejectedRequestCount:sum
            }
            // console.log("approved request data ",approvedRequest)
            await transaction.commit();
            return rejectedRequest;
        }
        catch(error){
            console.log("error ",error.message)
            await transaction.rollback();
        }
    },

    getAllDataBasedOnAllBrands:async function(req,data){
        try{
            var pool=await sql.connect(config);
            var transaction=new sql.Transaction();
            await transaction.begin()
            new sql.Request(transaction);
            // console.log("data ",data);
            
            // const locationID=req.location_id;
            const orderType=req?.orderType;
            const approvedBy=req?.approvedBy;
            const timeBand=req?.timeBand;
            let sum=0;
            let sum1=0;
            let sum2=0,sum3=0;
            // const partNotInMasterData=[]
            for(let res of data.dealers){
                brandId=res.BrandID,
                dealerId=res.DealerID
                // locationId=res.LocationID
                let query=`SELECT COUNT(Yellow_line) as yellow_count FROM Create_order_request_TD001_${dealerId} WHERE 1=1 and yellow_line=1`
                let params=[]
                let query1=`SELECT COUNT(Current_status) as approved_count FROM Create_Order_Request_TD001_${dealerId} WHERE 1=1 and Current_status='Approve'`
                let query2=`SELECT COUNT(Current_status) as pending_count FROM CreateOrderRequestPending_TD001_${dealerId} WHERE 1=1 and Current_status='Pending'`
                let query3=`SELECT COUNT(Current_status) as rejected_count FROM Create_Order_Request_TD001_${dealerId} WHERE 1=1 and Current_status='Decline'`
                if(brandId){
                    query+=' AND BrandID=@brandId';
                    params.push({name:'brandId',value:brandId})
                }
                if(orderType){
                    query+=' AND orderTye=@orderType';
                    params.push({name:'orderType',value:orderType})
                }
                if(approvedBy){
                    query+=' AND SCSby=@approvedBy'
                    params.push({name:'approvedBy',value:approvedBy})
                }
                if(timeBand){
                    let band=timeBand.toLowerCase();
                    if(band==='today'){
                        query+='AND dateadded =getdate()'; 
                    }
                    else if(band==='yesterday'){
                        query += ' AND dateadded >DATEADD(DAY, -1, GETDATE())';
                    }
                    else if(band==='last week'){
                        query += ' AND dateadded > dateadd(DAY,-7,getdate())';
                    }
                    else{
                        query += ' AND dateadded > dateadd(month,-1,getdate()) ';
                    }
                }

                const request=await pool.request();

                params.forEach(param => {
                    request.input(param.name, param.value);
                });

                const result=await request.query(query);
                const result1=await request.query(query1);
                const result2=await request.query(query2);
                const result3=await request.query(query3);
            //    console.log((result3.recordset));
               
                sum+=result.recordset[0].yellow_count;
                sum1+=result1.recordset[0].approved_count;
                sum2+=result2.recordset[0].pending_count;
                sum3+=result3.recordset[0].rejected_count

            }
            // console.log("part not in master data ",partNotInMasterData)
            await transaction.commit();
            const partNotInMasterData={
                yellowLineCount:sum,
                approvedCount:sum1,
                pendingCount:sum2,
                rejectedCount:sum3
            }
            return partNotInMasterData;
        }
        catch(error){
            console.log("error ",error.message)
            await transaction.rollback();
        }
    }
}