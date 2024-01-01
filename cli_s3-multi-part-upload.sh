BUCKET_NAME=demo-s3-multi-part-upload-bucket
aws s3 mb s3://$BUCKET_NAME


### 模擬大型檔案 && 分割
dd if=/dev/zero of=DemoBigFile bs=1048576 count=100
split -b 20m DemoBigFile 100MB_part_


# init multi-part upload
aws s3api create-multipart-upload --bucket $BUCKET_NAME --key DemoBigFile
# 會回傳 UploadId (複製下來)
UPLOAD_ID=dz1D7lbwTnB62chZTOpRZxsSYT.tFDSCmeSgnAYWDxl.0cyw1GHeSu9mbTtdMwQAubY8ek4Zk8njweczevhK3SWUn67A4qQAcFow5aBA82IGxI0qcYgeCH.bbfQn9LV5Ds.bdlYodH4dN6zBPMGg6w--


### list existing multi part uploads
aws s3api list-multipart-uploads --bucket $BUCKET_NAME
# Console 上頭看不到, 只能用 sdk 或 cli 查看


# 開始上傳 multi-part (會花一段時間) 取得 ETag
aws s3api upload-part --bucket $BUCKET_NAME --key DemoBigFile --part-number 1 --body 100MB_part_aa --upload-id $UPLOAD_ID
aws s3api upload-part --bucket $BUCKET_NAME --key DemoBigFile --part-number 2 --body 100MB_part_ab --upload-id $UPLOAD_ID
aws s3api upload-part --bucket $BUCKET_NAME --key DemoBigFile --part-number 3 --body 100MB_part_ac --upload-id $UPLOAD_ID
aws s3api upload-part --bucket $BUCKET_NAME --key DemoBigFile --part-number 4 --body 100MB_part_ad --upload-id $UPLOAD_ID
aws s3api upload-part --bucket $BUCKET_NAME --key DemoBigFile --part-number 5 --body 100MB_part_ae --upload-id $UPLOAD_ID
# 逐筆上傳完畢以後, Console 上頭一樣看不到東西


### list multi-part
aws s3api list-parts --upload-id $UPLOAD_ID --bucket $BUCKET_NAME --key DemoBigFile
#ChecksumAlgorithm: null
#Initiator:
#  DisplayName: tony
#  ID: arn:aws:iam::297886803107:user/tony
#Owner:
#  DisplayName: tonychoucc2024a
#  ID: 5cb167382b89a42f80bc15c5470949312b281d53bfcaf89e69ff750228c9782e
#Parts:
#- ETag: '"8f4e33f3dc3e414ff94e5fb6905cba8c"'
#  LastModified: '2024-01-01T06:06:35+00:00'
#  PartNumber: 1
#  Size: 20971520
#- ETag: '"8f4e33f3dc3e414ff94e5fb6905cba8c"'
#  LastModified: '2024-01-01T06:07:31+00:00'
#  PartNumber: 2
#  Size: 20971520
#- ETag: '"8f4e33f3dc3e414ff94e5fb6905cba8c"'
#  LastModified: '2024-01-01T06:07:44+00:00'
#  PartNumber: 3
#  Size: 20971520
#- ETag: '"8f4e33f3dc3e414ff94e5fb6905cba8c"'
#  LastModified: '2024-01-01T06:07:54+00:00'
#  PartNumber: 4
#  Size: 20971520
#- ETag: '"8f4e33f3dc3e414ff94e5fb6905cba8c"'
#  LastModified: '2024-01-01T06:08:11+00:00'
#  PartNumber: 5
#  Size: 20971520
#StorageClass: STANDARD
# ------------------------


### 完成 multi-part upload
aws s3api complete-multipart-upload --bucket $BUCKET_NAME --key DemoBigFile --upload-id $UPLOAD_ID --multipart-upload \
    "{\"Parts\":[{\"ETag\":\"8f4e33f3dc3e414ff94e5fb6905cba8c\",\"PartNumber\":1},{\"ETag\":\"8f4e33f3dc3e414ff94e5fb6905cba8c\",\"PartNumber\":2},{\"ETag\":\"8f4e33f3dc3e414ff94e5fb6905cba8c\",\"PartNumber\":3},{\"ETag\":\"8f4e33f3dc3e414ff94e5fb6905cba8c\",\"PartNumber\":4},{\"ETag\":\"8f4e33f3dc3e414ff94e5fb6905cba8c\",\"PartNumber\":5}]}"
# 有點像是併檔的概念 (完成後, Console 上頭就可以看到東西了)
