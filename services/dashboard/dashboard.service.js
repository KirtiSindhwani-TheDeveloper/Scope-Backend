const { Transaction } = require('mssql2');
const config=require('../../dbConfig')
const sql=require('mssql')
const adminDashboardService=require('../dashboard/adminDashboard.service')
module.exports={

    getApprovedBy:async function(req,res){
        try{

            var pool=await sql.connect(config)
    
            const transaction=await new sql.Transaction(pool);
            await transaction.begin();
            new sql.Request(transaction)
            locationId=req?.location_id;
            // console.log("location id ",locationId);
            
            const query1=`SELECT DealerID from LocationInfo where LocationID=@locationId`;
            const result1=await pool.request()
            .input('locationId',locationId).query(query1)
             
            dealerId=result1.recordset[0].DealerID;
            // console.log("dealer id ",dealerId)
            const query=`SELECT distinct a.vcFirstName,a.vcLastName,a.bintId_Pk as userId from AdminMaster_GEN a LEFT JOIN Create_Order_Request_TD001_${dealerId} c ON a.bintId_Pk=c.SCSby where locationID=@locationId and a.btStatus=1 and a.type='A'`;
            const result=await pool.request()
            .input('dealerId',dealerId)
            .input('locationId',locationId).query(query);
            const userList=[]
            for(let i=0;i<result.recordset.length;i++){
                const userName=result.recordset[i].vcFirstName+" "+result.recordset[i].vcLastName;
                const userId=result.recordset[i].userId
                userList.push({userName:userName,id:userId})

            }
            // console.log("result ",result.recordset)
            await transaction.commit();
            return userList;

        }
        catch(err){
            console.log("error message ",err.message)
            await transaction.rollback();
        }
    },

    getPendingRequest:async function(req,res){
        try{
            let pool=await sql.connect(config)
            const transaction= await new sql.Transaction(pool);
            await transaction.begin();
            new sql.Request(transaction)
            dealerId=req.dealer_id;
            timeBand=req?.timeBand;
            let dateQuery='';
            if(timeBand){
                let band=timeBand.toLowerCase();
                if(band==='today'){
                    dateQuery+='AND dateadded =getdate()'; 
                }
                else if(band==='yesterday'){
                    dateQuery += ' AND dateadded >DATEADD(DAY, -1, GETDATE())';
                }
                else if(band==='last week'){
                    dateQuery += ' AND dateadded > dateadd(DAY,-7,getdate())';
                }
                else{
                    dateQuery += ' AND dateadded > dateadd(month,-1,getdate()) ';
                }
            }
            console.log("dealer ",dealerId);
            const query=`SELECT LocationID from LocationInfo where DealerID=@dealerId`
           
            const result=await pool.request()
            .input('dealerId',dealerId)
            .query(query);
            let sum=0;
            for(let res of result.recordset){
                locationId=res.LocationID
                let query1 = `
            SELECT COUNT(Current_status) as pending_count 
                        FROM CreateOrderRequestPending_TD001_${dealerId} 
                     WHERE LocationID = @locationId AND Current_status = 'Pending'`
                     query1+=dateQuery
                const result=await pool.request()
                .input('dealerId',dealerId)
                .input('locationId',locationId)
                .query(query1);
                sum+=result.recordset[0].pending_count
                // pendingRequests.push(result.recordset[0]);
            }
            const pendingRequests={
                pendingCount:sum
            }
            // console.log("pending request ",pendingRequests)
            await transaction.commit();
            return pendingRequests;

        }
        catch(err){
            console.log("error message ",err.message)
            await transaction.rollback();
        }
    },

    getRejectedRequest:async function(req,res){
        try{
            let pool=await sql.connect(config)
    
            const transaction= await new sql.Transaction(pool);
            await transaction.begin();
            new sql.Request(transaction)
            dealerId=req.dealer_id;
            // console.log("dealer ",dealerId);
            timeBand=req?.timeBand;
            let dateQuery='';
            if(timeBand){
                let band=timeBand.toLowerCase();
                if(band==='today'){
                    dateQuery+='AND dateadded =getdate()'; 
                }
                else if(band==='yesterday'){
                    dateQuery += ' AND dateadded =DATEADD(DAY, -1, GETDATE())';
                }
                else if(band==='last week'){
                    dateQuery += ' AND dateadded > dateadd(DAY,-7,getdate())';
                }
                else{
                    dateQuery += ' AND dateadded > dateadd(month,-1,getdate()) ';
                }
            }
            const query=`SELECT LocationID from LocationInfo where DealerID=@dealerId`

            const result=await pool.request()
            .input('dealerId',dealerId)
            .query(query);
            let sum=0;
            for(let res of result.recordset){
                locationId=res.LocationID
                let query1 = `
            SELECT COUNT(Current_status) as rejected_count 
                        FROM Create_Order_Request_TD001_${dealerId} 
                    WHERE LocationID = @locationId AND Current_status = 'Decline'          
        `;
                query1+=dateQuery;
                const result=await pool.request()
                .input('dealerId',dealerId)
                .input('locationId',locationId)
                .query(query1);
                sum+=result.recordset[0].rejected_count
               
            }
            const rejectedRequests={
                rejectedCount:sum
            }
            // console.log("rejected request ",rejectedRequests)
            await transaction.commit();
            return rejectedRequests;

        }
        catch(err){
            console.log("error message ",err.message)
            await transaction.rollback();
        }
    },
    
     getApprovedRequest:async function(req,res){
        try{
            let pool=await sql.connect(config)
    
            const transaction=await new sql.Transaction(pool);
            await transaction.begin();
            new sql.Request(transaction)
            dealerId=req.dealer_id;
            // console.log("dealer ",dealerId);
            timeBand=req?.timeBand;
            let dateQuery='';
            if(timeBand){
                let band=timeBand.toLowerCase();
                if(band==='today'){
                    dateQuery+='AND dateadded =getdate()'; 
                }
                else if(band==='yesterday'){
                    dateQuery += ' AND dateadded =DATEADD(DAY, -1, GETDATE())';
                }
                else if(band==='last week'){
                    dateQuery += ' AND dateadded > dateadd(DAY,-7,getdate())';
                }
                else{
                    dateQuery += ' AND dateadded > dateadd(month,-1,getdate()) ';
                }
            }
            const query=`SELECT LocationID from LocationInfo where DealerID=@dealerId`
            let sum=0;
            const result=await pool.request()
            .input('dealerId',dealerId)
            .query(query);
            for(let res of result.recordset){
                locationId=res.LocationID
                 query1 = `
              SELECT Count(Current_status) as approved_count
                        FROM Create_Order_Request_TD001_${dealerId}
                        WHERE LocationID = @locationId AND Current_status='Approve'
        `;
                query1+=dateQuery
                const result=await pool.request()
                .input('dealerId',dealerId)
                .input('locationId',locationId)
                .query(query1);
                sum+=result.recordset[0].approved_count
                // approvedRequests.push(result.recordset[0]);
            }
            const approvedRequest={
                approvedCount:sum
            }
            // console.log("approved request ",approvedRequests)
            await transaction.commit();
            return approvedRequest;

        }
        catch(err){
            console.log("error message ",err.message)
            await transaction.rollback();
        }
       
    },

    getPartNotInMaster:async function(req){

        try{
            let pool=await sql.connect(config);
            let transaction=await new sql.Transaction(pool);
            await transaction.begin();
            new sql.Request(transaction)
            dealerId=req.dealer_id;
            console.log("dealer ",dealerId);
            timeBand=req?.timeBand;
            let dateQuery='';
            if(timeBand){
                let band=timeBand.toLowerCase();
                if(band==='today'){
                    dateQuery+='AND dateadded =getdate()'; 
                }
                else if(band==='yesterday'){
                    dateQuery += ' AND dateadded =DATEADD(DAY, -1, GETDATE())';
                }
                else if(band==='last week'){
                    dateQuery += ' AND dateadded > dateadd(DAY,-7,getdate())';
                }
                else{
                    dateQuery += ' AND dateadded > dateadd(month,-1,getdate()) ';
                }
            }
            const query=`SELECT LocationID from LocationInfo where DealerID=@dealerId`

            const result=await pool.request()
            .input('dealerId',dealerId)
            .query(query);
            let sum=0;
            for(let id of result.recordset){
                locationId=id.LocationID
                let query = `
SELECT COUNT(Yellow_line) as yellow_line_count FROM Create_Order_Request_TD001_${dealerId} WHERE LocationID = @locationId and Yellow_line=1
                `;
                query+=dateQuery
                let result1=await pool.request()
                .input('locationId',locationId)
                // .input('dealerId',dealerId)
                .query(query);
                sum+=result1.recordset[0].yellow_line_count;
            }
            const partNotInMasterData={
                partNotInMasterCount:sum
            }
            // console.log("result in partnot ",partNotInMasterData)
            await transaction.commit();
            return partNotInMasterData
        }
        catch(error){
            console.log("error ",error)
            await transaction.rollback();
        }
        
    
    },

    getRejectedRequestBasedOnSelectedLocation:async function(req){
        try{
            let pool=await sql.connect(config);
            let transaction=await new sql.Transaction(pool);
            await transaction.begin();
            new sql.Request(transaction)
            locationIdArray=req.location_id;
            dealerId=req.dealer_id;
            timeBand=req?.timeBand;
            let sum=0;
            let dateQuery='';
            if(timeBand){
                let band=timeBand.toLowerCase();
                if(band==='today'){
                    dateQuery+='AND dateadded =getdate()'; 
                }
                else if(band==='yesterday'){
                    dateQuery += ' AND dateadded=DATEADD(DAY, -1, GETDATE())';
                }
                else if(band==='last week'){
                    dateQuery += ' AND dateadded > dateadd(DAY,-7,getdate())';
                }
                else{
                    dateQuery += ' AND dateadded > dateadd(month,-1,getdate()) ';
                }
            }

            for(let id of locationIdArray){
                locationId=id
                // console.log("location ",locationId);
                let query1 = `SELECT COUNT(Current_status) as rejected_count  FROM Create_Order_Request_TD001_${dealerId} WHERE LocationID = @locationId AND Current_status = 'Decline'`
                query1+=dateQuery
                let result=await pool.request()
                .input('locationId',locationId)
                .input('dealerId',dealerId)
                .query(query1);
                sum+=result.recordset[0].rejected_count;
                // rejectedRequests.push(result.recordset[0]);
                // console.log("result ",result.recordset[0])
            }
          const  rejectedRequests={
             rejectedCount:sum
            }
            await transaction.commit();
            return rejectedRequests;
        }
        catch(error){
            console.log("error ",error.message)
            await transaction.rollback();
        }
    },

    getPendingRequestOnSelectedLocation:async function(req){
        try{
            let pool=await sql.connect(config);
            let transaction=await new sql.Transaction(pool);
            await transaction.begin();
            new sql.Request(transaction)
            locationIdArray=req.location_id;
            timeBand=req?.timeBand;
            let dateQuery='';
            if(timeBand){
                let band=timeBand.toLowerCase();
                if(band==='today'){
                    dateQuery+='AND dateadded =getdate()'; 
                }
                else if(band==='yesterday'){
                    dateQuery += ' AND dateadded =DATEADD(DAY, -1, GETDATE())';
                }
                else if(band==='last week'){
                    dateQuery += ' AND dateadded > dateadd(DAY,-7,getdate())';
                }
                else{
                    dateQuery += ' AND dateadded > dateadd(month,-1,getdate()) ';
                }
            }
            dealerId=req.dealer_id;
            let sum=0;
            for(let id of locationIdArray){
                locationId=id
                // console.log("location ",locationId);
                
                let query1 = 
`SELECT COUNT(Current_status) as pending_request_count FROM CreateOrderRequestPending_TD001_${dealerId} WHERE LocationID = @locationId AND Current_status='Pending'`
                query1+=dateQuery;
                let result=await pool.request()
                .input('locationId',locationId)
                .input('dealerId',dealerId)
                .query(query1);
                sum+=result.recordset[0].pending_request_count
                // partNotInMasterData.push(result.recordset[0]);
                // console.log("result ",result.recordset)
            }
            const pendingRequests={
            pendingCount:sum
            }

            await transaction.commit();
            return pendingRequests;
        }
        catch(error){
            console.log("error ",error.message)
            await transaction.rollback();
        }
    },
   
    getApprovedRequestBasedOnSelectedLocation:async function(req){
        try{
            let pool=await sql.connect(config);
            let  transaction=await new sql.Transaction(pool);
            await transaction.begin();
            new sql.Request(transaction)
            locationIdArray=req.location_id;
            // console.log("dealerId",res)
             dealerId=req.dealer_id;
            timeBand=req?.timeBand;
            let sum=0;
            let dateQuery='';
            if(timeBand){
                let band=timeBand.toLowerCase();
                if(band==='today'){
                    dateQuery+='AND dateadded =getdate()'; 
                }
                else if(band==='yesterday'){
                    dateQuery += ' AND dateadded=DATEADD(DAY, -1, GETDATE())';
                }
                else if(band==='last week'){
                    dateQuery += ' AND dateadded > dateadd(DAY,-7,getdate())';
                }
                else{
                    dateQuery += ' AND dateadded > dateadd(month,-1,getdate()) ';
                }
            }
          
            for(let id of locationIdArray){
               
                locationId=id
                // console.log("location ",locationId);
                
                let query1 = `SELECT Count(Current_status) as approved_count FROM Create_Order_Request_TD001_${dealerId} WHERE LocationID = @locationId AND Current_status = 'Approve'`;
                query1+=dateQuery
                let result=await pool.request()
                .input('locationId',locationId)
                .input('dealerId',dealerId)
                .query(query1);
                sum+=result.recordset[0].approved_count;
               
                console.log("result ",result.recordset)
            }
            const approvedRequests={
            approvedCount:sum
            }
            await transaction.commit();
            return approvedRequests;
        }
        catch(error){
            console.log("error ",error.message)
            await transaction.rollback();
        }
    },

    getPartNotInMasterOnSelectedLocation:async function(req){
        try{
            let pool=await sql.connect(config);
            let transaction=await new sql.Transaction(pool);
            await transaction.begin();
            new sql.Request(transaction)
            locationIdArray=req?.location_id;
            timeBand=req?.timeBand;
            let dateQuery='';
            if(timeBand){
                let band=timeBand.toLowerCase();
                if(band==='today'){
                    dateQuery+='AND dateadded =getdate()'; 
                }
                else if(band==='yesterday'){
                    dateQuery += ' AND dateadded=DATEADD(DAY, -1, GETDATE())';
                }
                else if(band==='last week'){
                    dateQuery += ' AND dateadded > dateadd(DAY,-7,getdate())';
                }
                else{
                    dateQuery += ' AND dateadded > dateadd(month,-1,getdate()) ';
                }
            }
            dealerId=req.dealer_id
            let sum=0;
            for(let id of locationIdArray){
                locationId=id
                // console.log("location ",locationId);
               
                let query = `SELECT Count(Yellow_line) as yellow_line_count FROM Create_Order_Request_TD001_${dealerId} WHERE LocationID = @locationId and Yellow_line=1`;
                query+=dateQuery;
                let result=await pool.request()
                .input('locationId',locationId)
                .input('dealerId',dealerId)
                .query(query);
                sum+=result.recordset[0].yellow_line_count;
                // console.log("result ",result.recordset)
            }
            const partNotInMasterData={
            yellowLineCount:sum
            }
            await transaction.commit();
            // console.log("part not in master ",partNotInMasterData)
            return partNotInMasterData;
        }
        catch(error){
            console.log("error ",error.message)
            await transaction.rollback();
        }
     
    },

    getBrandAndDealerBasedOnLocation:async function(idArray){
        try{
            var pool= await sql.connect(config);
            const transaction=new sql.Transaction();

            await transaction.begin();
            new sql.Request(transaction)
            const obj=[];
            for(let id of idArray){

                const query=`Select BrandID, DealerID from LocationInfo where LocationId=@id `
    
                const result =await pool.request()
                .input('id',id)
                .query(query)
                obj.push({locationId:id,result:result.recordset[0]});
                // console.log("",result.recordset)
            }
            return obj

        }
        catch(error){
            console.log("error in fetching ",error.message)
        }
    },

    getLocationsBasedOnDealer:async function(req){
        try{

            var pool=await sql.connect(config);
            var transaction=new sql.Transaction();
            await transaction.begin();
            new sql.Request(transaction);
            dealerId=req.dealer_id;

            const query=`Select LocationID,Location,Dealer from LocationInfo where DealerID=@dealerId`;
            const result=await pool.request()
            .input('dealerId',dealerId)
            .query(query);

            // console.log("result ",result.recordset);

            return result.recordset
        }
        catch(eror){
            console.log("error ",error.message)
        }
    },

    getStockUploadOn:async function(req){
        try{
            const pool=await sql.connect(config);
            const transaction=new sql.Transaction();
            await transaction.begin();
            new sql.Request(transaction)
           
            locationId=req.location_id;
            console.log("location id ",locationId)
            const query=`Select StockDate from CurrentStock1 where LocationID=@locationId`;

            const result=await pool.request()
            .input('locationId',locationId)
            .query(query);
            console.log("result ",result.recordset)
            return result.recordset;

        }
        catch(error){
            console.log("error ",error.message)
        }
    },

    getAllInfoBasedAdminDashboard:async function(req){
        try{
            
            var pool=await sql.connect(config);
            var transaction=await new sql.Transaction(pool);
            await transaction.begin()
            new sql.Request(transaction);
            let responseData;
            const brandId=req?.brand_id;
            const dealerId=req?.dealer_id;
            const locationId=req?.location_id
            let query=''
            let data={}
            if(!brandId && !dealerId && !locationId){
                query='SELECT distinct BrandID ,DealerID from LocationInfo'
                 result1= await pool.request().query(query);
                // console.log(locations.recordset)
                data={
                    // locations:result1.recordset.LocationID,
                    dealers:result1.recordset,
                    brands:result1.recordset
                }
                // console.log("data in fetch-data ",data)
                responseData=await adminDashboardService.getAllDataBasedOnAllBrands(req,data)
            }
            else{

                query=`SELECT DealerID ,LocationID from LocationInfo where 1=1`;
                let params=[];
                if(dealerId){
                    query+=' AND DealerID=@dealerId';
                    params.push({name:'dealerId',value:dealerId});
                }
                if(locationId){
                    query+=' AND LocationID=@locationId';
                    params.push({name:'locationId',value:locationId})
                }
                if(brandId){
                    query+=' AND brandId=@brandId'
                    params.push({name:'brandId',value:brandId})
                }
    
                console.log("query ",query)
               const request= await pool.request();
                params.forEach(param => {
                    request.input(param.name, param.value);
                });
            
                const result= await request.query(query);
                // console.log("result of dynamic query ",result.recordset)
                data={
                    brandId:brandId,
                    dealers:result.recordset,
                    locations:locations.recordset
                }

                const [partNotInMasterDetails,noOfRequestApprovedDetails, noOfRequestPendingDetails, noOfRequestRejectedDetails] = await Promise.all([
                    adminDashboardService.getPartNotInMaster(req,data),
                    adminDashboardService.getNoOfRequestApproved(req,data),
                    adminDashboardService.getNoOfRequestPending(req,data),
                    adminDashboardService.getNoOfRequestRejected(req,data)
                ]);
                 responseData = {
                    partNotInMasterData: partNotInMasterDetails,
                    noOfRequestPendingData: noOfRequestPendingDetails,
                    noOfRequestApprovedData: noOfRequestApprovedDetails,
                    noOfRequestRejectedData: noOfRequestRejectedDetails,
                  };
            }
             
            // console.log("data in fetch-data ",data)
            
            
              await transaction.commit();              
              return responseData
        }
        catch(error){
            console.log("error ",error.message);
            await transaction.rollback();
        }

    },

    getAllInfoBasedOnLocations:async function(req) {
        try{
            const [partNotInMasterDetails,noOfRequestApprovedDetails, noOfRequestPendingDetails, noOfRequestRejectedDetails] = await Promise.all([

                this.getPartNotInMasterOnSelectedLocation(req),
                this.getApprovedRequestBasedOnSelectedLocation(req),
                this.getPendingRequestOnSelectedLocation(req),
                this.getRejectedRequestBasedOnSelectedLocation(req)

            ]);
            const responseData = {
                partNotInMasterData: partNotInMasterDetails,
                noOfRequestPendingData: noOfRequestPendingDetails,
                noOfRequestApprovedData: noOfRequestApprovedDetails,
                noOfRequestRejectedData: noOfRequestRejectedDetails,
              };            
              return responseData
        }
        catch(error){
            console.log("error ",error.message);
        }
    },


    getAllInfoBasedOnAllLocations:async function(req){
        try{
            const [partNotInMasterDetails,noOfRequestApprovedDetails, noOfRequestPendingDetails, noOfRequestRejectedDetails] = await Promise.all([

                this.getPartNotInMaster(req),
                this.getApprovedRequest(req),
                this.getPendingRequest(req),
                this.getRejectedRequest(req)

            ]);
            
            const responseData = {
                partNotInMasterData: partNotInMasterDetails,
                noOfRequestPendingData: noOfRequestPendingDetails,
                noOfRequestApprovedData: noOfRequestApprovedDetails,
                noOfRequestRejectedData: noOfRequestRejectedDetails,
              };
                         
              return responseData
        }
        catch(error){
            console.log("error ",error.message);
            
        }
    }



    
   

}