
class OssUtils {
    async upLoadFile (LocalFileData,CloudFileName) {
        var cos = new COS({
            SecretId: "",
            SecretKey: "",
        });
        
        try {
            const fileData = LocalFileData
            const fileName = CloudFileName
            // var data = await cos.uploadFile({
            //     Bucket: 'pkcd-1255701652',
            //     Region: 'ap-hongkong',
            //     Key: fileName,
            //     FilePath: filePath,
            // });
            
            var data = await cos.putObject({
                Bucket: '',
                Region: '',
                Key: fileName,
                Body: Buffer.from(fileData),
            });
            const uploadResult = JSON.stringify(data);
            console.log(uploadResult)
            return uploadResult
        } catch (err) {
            console.log('err is ->', err);
            return null
        }
    }
}

module.exports = new OssUtils()