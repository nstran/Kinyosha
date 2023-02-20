DO $$
BEGIN
delete from public."Category" where "CategoryId" 
in ('71e63d28-e4f9-4d63-95b8-6b375edd2bea', 'b1bfa7a8-2418-4367-ad77-887669a982b5', 
	'1a565170-02d7-4e47-b8d8-de0611d47747', 'D8F88F51-B979-45D2-B478-5FB98FA66329',
   '3d64ea91-3cb9-40a7-a8be-2fef93e5c42c',
'c29ea01a-0bb9-4995-8578-5d552ef79372',
'8556d68f-33c9-4ed9-a4e1-66d072f80e84',
'2972b58e-2506-4641-bb83-582a8d08b398',
'7bf50b4a-0bbd-4519-a392-608b3d7809c8',
'b7a27304-86d7-4817-a93e-46b482621dd7',
'98fa12ce-820a-48e0-96b3-b1c78b7d7095');
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."CategoryType" where "CategoryTypeId" = '607314E0-AC2C-42A7-9E64-8180F499B288') THEN
INSERT INTO public."CategoryType"("CategoryTypeId", "CategoryTypeName", "CategoryTypeCode", "Active", "TenantId")
	VALUES
	('607314E0-AC2C-42A7-9E64-8180F499B288', 'Nhóm công đoạn', 'NCD', true, '04d0d35e-eacb-49da-87fd-cdc0913caeec');
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."CategoryType" where "CategoryTypeId" = '5EC25483-4350-4333-A0E0-FB6DDCC4AFC0') THEN
INSERT INTO public."CategoryType"("CategoryTypeId", "CategoryTypeName", "CategoryTypeCode", "Active", "TenantId")
VALUES
('5EC25483-4350-4333-A0E0-FB6DDCC4AFC0', 'Công đoạn', 'CD', true, '04d0d35e-eacb-49da-87fd-cdc0913caeec');
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."CategoryType" where "CategoryTypeId" = '181C508D-0B77-4979-ADB2-173B30141369') THEN
INSERT INTO public."CategoryType"("CategoryTypeId", "CategoryTypeName", "CategoryTypeCode", "Active", "TenantId")
VALUES
('181C508D-0B77-4979-ADB2-173B30141369', 'Nội dung kiểm tra', 'NDKT', true, '04d0d35e-eacb-49da-87fd-cdc0913caeec');
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."CategoryType" where "CategoryTypeId" = '9D71C863-17C0-4D6C-98E2-64DFC101FB3C') THEN
INSERT INTO public."CategoryType"("CategoryTypeId", "CategoryTypeName", "CategoryTypeCode", "Active", "TenantId")
VALUES
('9D71C863-17C0-4D6C-98E2-64DFC101FB3C', 'Quy cách/ghi chú/tham khảo', 'QC', true, '04d0d35e-eacb-49da-87fd-cdc0913caeec');
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."CategoryType" where "CategoryTypeId" = 'FE214B68-962A-4CD2-8510-10D74BA8538C') THEN
INSERT INTO public."CategoryType"("CategoryTypeId", "CategoryTypeName", "CategoryTypeCode", "Active", "TenantId")
VALUES
('FE214B68-962A-4CD2-8510-10D74BA8538C', 'Hạng mục kiểm tra lỗi', 'KTL', true, '04d0d35e-eacb-49da-87fd-cdc0913caeec');
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."CategoryType" where "CategoryTypeId" = '5A925935-DD28-4BAF-892E-780504E458E6') THEN
INSERT INTO public."CategoryType"("CategoryTypeId", "CategoryTypeName", "CategoryTypeCode", "Active", "TenantId")
VALUES
('5A925935-DD28-4BAF-892E-780504E458E6', 'Số người thực hiện công đoạn', 'SNTHCD', true, '04d0d35e-eacb-49da-87fd-cdc0913caeec');
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."CategoryType" where "CategoryTypeId" = '84B435A3-2F01-4429-A885-27A5D481F4AA') THEN
INSERT INTO public."CategoryType"("CategoryTypeId", "CategoryTypeName", "CategoryTypeCode", "Active", "TenantId")
VALUES
('84B435A3-2F01-4429-A885-27A5D481F4AA', 'Kiểu kết quả', 'KKQ', true, '04d0d35e-eacb-49da-87fd-cdc0913caeec');
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = 'd6d41163-c064-4d59-b463-019dc42de5ee') THEN
INSERT INTO public."Category"
VALUES
('d6d41163-c064-4d59-b463-019dc42de5ee', N'1 (Người phụ trách)', N'1', '5a925935-dd28-4baf-892e-780504e458e6', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = 'bbea8e6e-5b37-4b1c-963b-9197450cb3a9') THEN
INSERT INTO public."Category"
VALUES
('bbea8e6e-5b37-4b1c-963b-9197450cb3a9', N'2 (Người bắt đầu, người kết thúc)', N'2', '5a925935-dd28-4baf-892e-780504e458e6', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = '3D64EA91-3CB9-40A7-A8BE-2FEF93E5C42C') THEN
INSERT INTO public."Category"
VALUES
('3D64EA91-3CB9-40A7-A8BE-2FEF93E5C42C', N'Tiêu đề', N'LAYBEL', '84B435A3-2F01-4429-A885-27A5D481F4AA', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = 'C29EA01A-0BB9-4995-8578-5D552EF79372') THEN
INSERT INTO public."Category"
VALUES
('C29EA01A-0BB9-4995-8578-5D552EF79372', N'Tick', N'TICK', '84B435A3-2F01-4429-A885-27A5D481F4AA', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = '8556D68F-33C9-4ED9-A4E1-66D072F80E84') THEN
INSERT INTO public."Category"
VALUES
('8556D68F-33C9-4ED9-A4E1-66D072F80E84', N'Nhập thời gian (giờ:phút)', N'HM', '84B435A3-2F01-4429-A885-27A5D481F4AA', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = '2972B58E-2506-4641-BB83-582A8D08B398') THEN
INSERT INTO public."Category"
VALUES
('2972B58E-2506-4641-BB83-582A8D08B398', N'Nhập thời gian (ngày/tháng/năm)', N'DMY', '84B435A3-2F01-4429-A885-27A5D481F4AA', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = '7BF50B4A-0BBD-4519-A392-608B3D7809C8') THEN
INSERT INTO public."Category"
VALUES
('7BF50B4A-0BBD-4519-A392-608B3D7809C8', N'Nhập thời gian (Ngày/tháng giờ:phút)', N'DMHM', '84B435A3-2F01-4429-A885-27A5D481F4AA', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = 'B7A27304-86D7-4817-A93E-46B482621DD7') THEN
INSERT INTO public."Category"
VALUES
('B7A27304-86D7-4817-A93E-46B482621DD7', N'Nhập giá trị', N'INPUT', '84B435A3-2F01-4429-A885-27A5D481F4AA', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."CategoryType" where "CategoryTypeId" = '4D7DFEDF-708C-4633-9573-D5882B18FF40') THEN
INSERT INTO public."CategoryType"("CategoryTypeId", "CategoryTypeName", "CategoryTypeCode", "Active",  "TenantId")
VALUES
('4D7DFEDF-708C-4633-9573-D5882B18FF40', 'Loại kho', 'KHO', true, '04d0d35e-eacb-49da-87fd-cdc0913caeec');
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = '71e63d28-e4f9-4d63-95b8-6b375edd2bea') THEN
INSERT INTO public."Category"
VALUES
('71e63d28-e4f9-4d63-95b8-6b375edd2bea', N'Kho nguyên vật liệu', N'NVL', '4D7DFEDF-708C-4633-9573-D5882B18FF40', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = 'b1bfa7a8-2418-4367-ad77-887669a982b5') THEN
INSERT INTO public."Category"
VALUES
('b1bfa7a8-2418-4367-ad77-887669a982b5', N'Kho công cụ dụng cụ', N'CCDC', '4D7DFEDF-708C-4633-9573-D5882B18FF40', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = '1a565170-02d7-4e47-b8d8-de0611d47747') THEN
INSERT INTO public."Category"
VALUES
('1a565170-02d7-4e47-b8d8-de0611d47747', N'Kho chờ sản xuất', N'CSX', '4D7DFEDF-708C-4633-9573-D5882B18FF40', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = 'D8F88F51-B979-45D2-B478-5FB98FA66329') THEN
INSERT INTO public."Category"
VALUES
('D8F88F51-B979-45D2-B478-5FB98FA66329', N'Kho tái sử dụng', N'TSK', '4D7DFEDF-708C-4633-9573-D5882B18FF40', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = 'e5993777-0330-40dc-bd72-99a6afaf2aec') THEN
INSERT INTO public."Category"
VALUES
('e5993777-0330-40dc-bd72-99a6afaf2aec', N'Kho thành phẩm', N'KTP', '4D7DFEDF-708C-4633-9573-D5882B18FF40', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."CategoryType" where "CategoryTypeId" = '651160f4-edd7-4e3f-a3a6-de3577035108') THEN
INSERT INTO public."CategoryType"("CategoryTypeId", "CategoryTypeName", "CategoryTypeCode", "Active", "TenantId")
	VALUES
	('651160f4-edd7-4e3f-a3a6-de3577035108', 'Trạng thái sản xuất', 'TSX', true, '04d0d35e-eacb-49da-87fd-cdc0913caeec');
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = '08068b15-8d6d-455f-ad06-2bf41b16dbd7') THEN
INSERT INTO public."Category"
VALUES
('08068b15-8d6d-455f-ad06-2bf41b16dbd7', N'Hoàn thành', N'HNT', '651160f4-edd7-4e3f-a3a6-de3577035108', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = '317916e2-8b91-41c3-9151-62bfdf838cb1') THEN
INSERT INTO public."Category"
VALUES
('317916e2-8b91-41c3-9151-62bfdf838cb1', N'Đang thực hiện', N'DTH', '651160f4-edd7-4e3f-a3a6-de3577035108', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = 'a49d572b-2263-4c23-979e-54c81232952f') THEN
INSERT INTO public."Category"
VALUES
('a49d572b-2263-4c23-979e-54c81232952f', N'Đã xác nhận', N'DXN', '651160f4-edd7-4e3f-a3a6-de3577035108', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = 'ddb2de02-62d5-4552-a3c6-c42280245550') THEN
INSERT INTO public."Category"
VALUES
('ddb2de02-62d5-4552-a3c6-c42280245550', N'Chưa bắt đầu', N'CBD', '651160f4-edd7-4e3f-a3a6-de3577035108', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."CategoryType" where "CategoryTypeId" = 'A9FF59FE-9D29-4B51-99ED-4A614F9D2259') THEN
INSERT INTO public."CategoryType"("CategoryTypeId", "CategoryTypeName", "CategoryTypeCode", "Active", "TenantId")
	VALUES
	('A9FF59FE-9D29-4B51-99ED-4A614F9D2259', 'Trạng thái lô sản xuất', 'LSX', true, '04d0d35e-eacb-49da-87fd-cdc0913caeec');
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = 'FEB10401-DDAA-49A0-B0BA-6EB8E6747C57') THEN
INSERT INTO public."Category"
VALUES
('FEB10401-DDAA-49A0-B0BA-6EB8E6747C57', N'Chưa sản xuất', N'TTLNCSX', 'A9FF59FE-9D29-4B51-99ED-4A614F9D2259', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = '04D20949-553B-46AE-A656-D39F831DB8C2') THEN
INSERT INTO public."Category"
VALUES
('04D20949-553B-46AE-A656-D39F831DB8C2', N'Bắt đầu', N'TTLNBD', 'A9FF59FE-9D29-4B51-99ED-4A614F9D2259', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = '1DC8E803-9C2D-4C61-A2F6-C84D4E67922C') THEN
INSERT INTO public."Category"
VALUES
('1DC8E803-9C2D-4C61-A2F6-C84D4E67922C', N'Đang sản xuất', N'TTLNDCSX', 'A9FF59FE-9D29-4B51-99ED-4A614F9D2259', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = '7A318CAB-96D3-4790-BEE5-51C2EC8F2831') THEN
INSERT INTO public."Category"
VALUES
('7A318CAB-96D3-4790-BEE5-51C2EC8F2831', N'Tạm dừng', N'TTLNTD', 'A9FF59FE-9D29-4B51-99ED-4A614F9D2259', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;
DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = 'F0E2E763-DC60-4F46-BAC9-5350B766FB02') THEN
INSERT INTO public."Category"
VALUES
('F0E2E763-DC60-4F46-BAC9-5350B766FB02', N'Hoàn thành', N'TTLNHT', 'A9FF59FE-9D29-4B51-99ED-4A614F9D2259', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;
DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = '11A4125E-FE98-4A94-8CA9-57F0A8484D6E') THEN
INSERT INTO public."Category"
VALUES
('11A4125E-FE98-4A94-8CA9-57F0A8484D6E', N'Hủy', N'TTLNH', 'A9FF59FE-9D29-4B51-99ED-4A614F9D2259', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."CategoryType" where "CategoryTypeId" = 'E87C2066-8AF4-4C16-8498-08B8AA256B24') THEN
INSERT INTO public."CategoryType"("CategoryTypeId", "CategoryTypeName", "CategoryTypeCode", "Active", "TenantId")
	VALUES
	('E87C2066-8AF4-4C16-8498-08B8AA256B24', 'Trạng thái công đoạn sản xuất', 'TTCDSX', true, '04d0d35e-eacb-49da-87fd-cdc0913caeec');
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = '592AE8F3-B681-48B3-BFFC-1A83016F3067') THEN
INSERT INTO public."Category"
VALUES
('592AE8F3-B681-48B3-BFFC-1A83016F3067', N'Chưa bắt đầu', N'TTCDCBD', 'E87C2066-8AF4-4C16-8498-08B8AA256B24', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = 'E7E1548E-B0F7-4384-B410-54CCBE1DD224') THEN
INSERT INTO public."Category"
VALUES
('E7E1548E-B0F7-4384-B410-54CCBE1DD224', N'Đang thực hiện', N'TTCDDTH', 'E87C2066-8AF4-4C16-8498-08B8AA256B24', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = '9D886B64-DD08-4E31-9683-9BC22AF00549') THEN
INSERT INTO public."Category"
VALUES
('9D886B64-DD08-4E31-9683-9BC22AF00549', N'Hoàn thành', N'TTCDHT', 'E87C2066-8AF4-4C16-8498-08B8AA256B24', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = '11099B24-C71F-4380-9974-81388FB485CD') THEN
INSERT INTO public."Category"
VALUES
('11099B24-C71F-4380-9974-81388FB485CD', N'Tạm dừng', N'TTCDTD', 'E87C2066-8AF4-4C16-8498-08B8AA256B24', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = '29B8B401-0A1C-46E7-89E5-DE1C2A410D84') THEN
INSERT INTO public."Category"
VALUES
('29B8B401-0A1C-46E7-89E5-DE1C2A410D84', N'Đã xác nhận', N'TTCDDXN', 'E87C2066-8AF4-4C16-8498-08B8AA256B24', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = 'C343E78E-B81D-4174-A932-ECEF498D1C2A') THEN
INSERT INTO public."Category"
VALUES
('C343E78E-B81D-4174-A932-ECEF498D1C2A', N'Hủy', N'TTCDH', 'E87C2066-8AF4-4C16-8498-08B8AA256B24', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = '4E9F375B-B6D3-4A96-B38C-26CA2FE94C7E') THEN
INSERT INTO public."Category"
VALUES
('4E9F375B-B6D3-4A96-B38C-26CA2FE94C7E', N'Mới', N'TPHN', 'a1079f84-0202-4844-b653-eef2956600e7', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = '615FF68E-FA0C-4A35-B664-E4BF4BDC0CD6') THEN
INSERT INTO public."Category"
VALUES
('615FF68E-FA0C-4A35-B664-E4BF4BDC0CD6', N'Mới', N'TPHXN', '38b5d0da-05f9-4c7d-824d-042aef417f15', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."Category" where "CategoryId" = '7EBAA7F8-2C98-4710-898C-784B75AB45CC') THEN
INSERT INTO public."Category"
VALUES
('7EBAA7F8-2C98-4710-898C-784B75AB45CC', N'Chờ xác nhận', N'TPHXCXN', '38b5d0da-05f9-4c7d-824d-042aef417f15', true, 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', '2022-02-25', Null,Null,false,true, '04D0D35E-EACB-49DA-87FD-CDC0913CAEEC',0);
END IF;
END $$;

DO $$
BEGIN
IF EXISTS (select * from public."MenuBuild" where "MenuBuildId" = 'e3a9a379-c4bb-4b9a-a34e-604b71f61df6') THEN
update public."MenuBuild" set "Name" = 'Quản lý hàng hóa' where "MenuBuildId" = 'e3a9a379-c4bb-4b9a-a34e-604b71f61df6';
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'DBD9ED37-044C-4A35-9AB6-3E4BEDA425D2') THEN
INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('DBD9ED37-044C-4A35-9AB6-3E4BEDA425D2', 'man/manufacture/process-management/list/view', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '334634FF-883C-43AE-8D10-6ACA2767FA1C') THEN
INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('334634FF-883C-43AE-8D10-6ACA2767FA1C', 'man/manufacture/process-management/list/edit', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '75436023-A385-47E4-9ED5-7975828F9953') THEN
INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('75436023-A385-47E4-9ED5-7975828F9953', 'man/manufacture/process-management/list/add', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '102F89A8-5910-4630-8FFA-AEE60AD2E7F5') THEN
INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('102F89A8-5910-4630-8FFA-AEE60AD2E7F5', 'man/manufacture/process-management/list/delete', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'CC79BE1C-C4B3-44B1-A74A-EC05BEEC630C') THEN
INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('CC79BE1C-C4B3-44B1-A74A-EC05BEEC630C', 'man/manufacture/product-order-workflow/list/delete', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '34A478DD-2CAA-4468-BA40-67EC288F734A') THEN
INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('34A478DD-2CAA-4468-BA40-67EC288F734A', 'man/manufacture/production-order/detail/delete', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'F14FC735-69D6-4B46-AECF-E000D1B7622C') THEN
INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('F14FC735-69D6-4B46-AECF-E000D1B7622C', 'man/manufacture/production-order/detail/add', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '7EB257AB-B7EF-442B-B831-FC1B8A5CF55D') THEN
INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('7EB257AB-B7EF-442B-B831-FC1B8A5CF55D', 'man/manufacture/production-order/list/delete', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'C629A7D8-764B-4FB7-A97D-C53C66E62062') THEN
INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('C629A7D8-764B-4FB7-A97D-C53C66E62062', 'man/manufacture/track-production/track/edit', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'FBDD74CB-E294-42D3-89CF-74BAE0436BCD') THEN
INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('FBDD74CB-E294-42D3-89CF-74BAE0436BCD', 'man/manufacture/track-production/track/delete', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'FC0A826A-C3B1-4752-9ECF-C3588FD34F40') THEN
INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('FC0A826A-C3B1-4752-9ECF-C3588FD34F40', 'man/manufacture/lot-no/information/view', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '48FE0462-0420-44A6-946D-A05469480798') THEN
INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('48FE0462-0420-44A6-946D-A05469480798', 'man/manufacture/lot-no/information/add', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '1D974903-5EAB-4211-873A-21D8AA58D1C1') THEN
INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('1D974903-5EAB-4211-873A-21D8AA58D1C1', 'man/manufacture/lot-no/information/edit', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '0E55DB1C-FFCD-4719-8DDE-2D2B159100F8') THEN
INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('0E55DB1C-FFCD-4719-8DDE-2D2B159100F8', 'man/manufacture/lot-no/information/delete', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '269366A6-D1DC-4392-B5E2-21DFA1EF9F24') THEN
INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('269366A6-D1DC-4392-B5E2-21DFA1EF9F24', 'man/manufacture/inventory-of-defective-goods/create-update/view', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '53EE550E-FCF2-4AF7-9E4F-EA74CB0DBF95') THEN
INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('53EE550E-FCF2-4AF7-9E4F-EA74CB0DBF95', 'man/manufacture/inventory-of-defective-goods/create-update/download', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '9A3756C3-B966-4DE2-9C60-02A93B0052DE') THEN
INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('9A3756C3-B966-4DE2-9C60-02A93B0052DE', 'man/manufacture/hr-report/list/view', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'E8C19722-25F1-4264-ACF8-0F64D698554A') THEN
INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('E8C19722-25F1-4264-ACF8-0F64D698554A', 'man/manufacture/hr-report/list/download', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '1DC01A85-1F40-412B-8230-8E8733D2C4E5') THEN
INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('1DC01A85-1F40-412B-8230-8E8733D2C4E5', 'man/manufacture/manufacture-report/list/view', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'C68D3B6E-41AA-48A4-93E6-04E3B395440F') THEN
INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('C68D3B6E-41AA-48A4-93E6-04E3B395440F', 'man/manufacture/manufacture-report/list/download', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '8EF1D4EB-1782-4341-98FA-5CCD1D95E377') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('8EF1D4EB-1782-4341-98FA-5CCD1D95E377', 'war/warehouse/de-nghi-xuat-kho/create/add', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'BBCA7AE3-F94A-4871-B61D-FEAFC061126F') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('BBCA7AE3-F94A-4871-B61D-FEAFC061126F', 'war/warehouse/de-nghi-xuat-kho/create/view', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '5289FE37-389C-4BA5-AE4C-51883F5EC2EE') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('5289FE37-389C-4BA5-AE4C-51883F5EC2EE', 'war/warehouse/de-nghi-xuat-kho/detail/view', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '4E3E91A0-AB2B-4B70-BEE1-BC70F5638DAB') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('4E3E91A0-AB2B-4B70-BEE1-BC70F5638DAB', 'war/warehouse/de-nghi-xuat-kho/detail/download', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '8C059875-0E0C-40D3-A5D2-35DBCC84FCA3') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('8C059875-0E0C-40D3-A5D2-35DBCC84FCA3', 'war/warehouse/de-nghi-xuat-kho/detail/send_approve', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'C55FD508-F46B-48D9-BF1A-4BB5773CC2FD') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('C55FD508-F46B-48D9-BF1A-4BB5773CC2FD', 'war/warehouse/de-nghi-xuat-kho/detail/approve', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'C7EB3986-004D-4FFA-B48F-4CD4725578C3') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('C7EB3986-004D-4FFA-B48F-4CD4725578C3', 'war/warehouse/de-nghi-xuat-kho/detail/reject', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '2DDA1B45-3EC8-4747-9B28-D64AEED7F5A9') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('2DDA1B45-3EC8-4747-9B28-D64AEED7F5A9', 'war/warehouse/de-nghi-xuat-kho/detail/edit', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'ADF26B3B-C578-42DF-815D-4B8A90BBCCA7') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('ADF26B3B-C578-42DF-815D-4B8A90BBCCA7', 'war/warehouse/de-nghi-xuat-kho/list/add', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'C4DC1C26-D623-4D64-87C5-EEE85177ECBD') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('C4DC1C26-D623-4D64-87C5-EEE85177ECBD', 'war/warehouse/de-nghi-xuat-kho/list/view', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '2C033C3E-2728-4E87-8EE2-DDEE27FF460C') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('2C033C3E-2728-4E87-8EE2-DDEE27FF460C', 'war/warehouse/de-nghi-xuat-kho/list/delete', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'C020676E-B088-470A-A030-592B46B13D14') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('C020676E-B088-470A-A030-592B46B13D14', 'war/warehouse/inventory-receiving-voucher/list/add', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'B143B59A-875E-47F5-9B28-3D700D711ADA') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('B143B59A-875E-47F5-9B28-3D700D711ADA', 'war/warehouse/inventory-receiving-voucher/list/download', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'D07B7835-13BE-4EAA-966C-3C7F7721AD43') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('D07B7835-13BE-4EAA-966C-3C7F7721AD43', 'war/warehouse/inventory-receiving-voucher/list/delete', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '256EF445-1FF9-4556-B24E-667AA3AFBA7A') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('256EF445-1FF9-4556-B24E-667AA3AFBA7A', 'war/warehouse/inventory-receiving-voucher/detail/add', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '2B8EE61C-4864-4303-9934-775E705AB08B') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('2B8EE61C-4864-4303-9934-775E705AB08B', 'war/warehouse/inventory-receiving-voucher/detail/delete', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'CCC07B9C-C7C2-4101-8FA9-65080188B134') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('CCC07B9C-C7C2-4101-8FA9-65080188B134', 'war/warehouse/inventory-receiving-voucher/detail/warehouse', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '9008E01E-0ADF-4F73-90E3-76A6C1F46A66') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('9008E01E-0ADF-4F73-90E3-76A6C1F46A66', 'war/warehouse/inventory-receiving-voucher/detail/download', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'E76AE0F7-2CBA-4346-8305-1A3BD962C7D4') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('E76AE0F7-2CBA-4346-8305-1A3BD962C7D4', 'war/warehouse/inventory-receiving-voucher/detail/print', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '3F0C18A2-B63B-4687-B79D-2C498465D853') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('3F0C18A2-B63B-4687-B79D-2C498465D853', 'war/warehouse/inventory-receiving-voucher/create/add', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '7C9AC121-985D-4ACB-B93D-8E78DAE67225') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('7C9AC121-985D-4ACB-B93D-8E78DAE67225', 'war/warehouse/inventory-delivery-voucher/list/delete', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'E8253D57-FFDC-4B47-8632-C892E7D7ACB3') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('E8253D57-FFDC-4B47-8632-C892E7D7ACB3', 'war/warehouse/inventory-delivery-voucher/create-update/add', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '0E01EA24-0ED1-42EE-BFEC-5CECF58B0CAE') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('0E01EA24-0ED1-42EE-BFEC-5CECF58B0CAE', 'war/warehouse/inventory-delivery-voucher/create-update/delete', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '3E6D84E6-1C3C-4927-900D-3050BFA3FF4D') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('3E6D84E6-1C3C-4927-900D-3050BFA3FF4D', 'war/warehouse/inventory-delivery-voucher/detail/view', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '0706CF76-8602-4025-AE07-75D86A0F96BC') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('0706CF76-8602-4025-AE07-75D86A0F96BC', 'war/warehouse/inventory-delivery-voucher/detail/export', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'C7F09972-9F39-48BB-A0BD-88B258458F67') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('C7F09972-9F39-48BB-A0BD-88B258458F67', 'war/warehouse/inventory-delivery-voucher/detail/add', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '86620F3F-630B-42A5-8FA3-6F543E09CC35') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('86620F3F-630B-42A5-8FA3-6F543E09CC35', 'war/warehouse/inventory-delivery-voucher/detail/delete', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '26E26AD4-6A9E-495D-83A3-CC9D82A516AD') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('26E26AD4-6A9E-495D-83A3-CC9D82A516AD', 'war/warehouse/inventory-delivery-voucher/detail/print', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '85C437FC-9321-4CAC-AFDD-05194AB91A79') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('85C437FC-9321-4CAC-AFDD-05194AB91A79', 'war/warehouse/inventory-delivery-voucher/detail/download', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '3C4DFCC3-3440-449A-9C17-B16CE66167D1') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('3C4DFCC3-3440-449A-9C17-B16CE66167D1', 'war/warehouse/in-stock-report/list/download', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'BB491548-AB52-470D-A63F-E9E3E70A55DD') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('BB491548-AB52-470D-A63F-E9E3E70A55DD', 'war/warehouse/kiem-ke-kho/list/view', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '7279D4F5-D8E7-481C-9643-3F22D65CD796') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('7279D4F5-D8E7-481C-9643-3F22D65CD796', 'war/warehouse/kiem-ke-kho/list/add', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'B6866AC1-1C45-4C5D-8C0C-3A6851252B87') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('B6866AC1-1C45-4C5D-8C0C-3A6851252B87', 'war/warehouse/kiem-ke-kho/list/delete', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'D8A5B520-158B-44E8-905B-5E60CD646EA0') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('D8A5B520-158B-44E8-905B-5E60CD646EA0', 'war/warehouse/kiem-ke-kho/detail/view', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '879249A5-A8CE-4A15-84C9-47694C28A900') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('879249A5-A8CE-4A15-84C9-47694C28A900', 'war/warehouse/kiem-ke-kho/detail/add', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '28EEAA4F-262A-4043-A206-82AA321AC7B5') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('28EEAA4F-262A-4043-A206-82AA321AC7B5', 'war/warehouse/kiem-ke-kho/detail/complete', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '733DBF63-6EBB-4332-A098-079F51978704') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('733DBF63-6EBB-4332-A098-079F51978704', 'war/warehouse/kiem-ke-kho/detail/balance', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'B0C4A86C-892E-4C8D-90DE-C7F607488AE8') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('B0C4A86C-892E-4C8D-90DE-C7F607488AE8', 'war/warehouse/kiem-ke-kho/detail/edit', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'F165880E-14D9-4116-A7E0-24A45CDC1FEB') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('F165880E-14D9-4116-A7E0-24A45CDC1FEB', 'war/warehouse/kiem-ke-kho/detail/download', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '653CC13B-6CC4-48A8-A3A3-1BC9D650434D') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('653CC13B-6CC4-48A8-A3A3-1BC9D650434D', 'war/warehouse/kiem-ke-kho/detail/import', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '6C2DA5FE-5EC6-4535-A5FC-6B635CBD7361') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('6C2DA5FE-5EC6-4535-A5FC-6B635CBD7361', 'war/warehouse/thanh-pham-xuat/list/view', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '8737AAD8-793C-41DA-8557-DBD1805C9D65') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('8737AAD8-793C-41DA-8557-DBD1805C9D65', 'war/warehouse/thanh-pham-xuat/list/add', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'A8883C28-2E69-4D94-A959-EBAD54C92DA7') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('A8883C28-2E69-4D94-A959-EBAD54C92DA7', 'war/warehouse/thanh-pham-xuat/create/view', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '9A355298-0266-426E-9341-909E138ECC23') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('9A355298-0266-426E-9341-909E138ECC23', 'war/warehouse/thanh-pham-xuat/create/add', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'C70DEDB4-B7C5-49BA-B467-1D24280286A0') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('C70DEDB4-B7C5-49BA-B467-1D24280286A0', 'war/warehouse/thanh-pham-xuat/create/delete', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'FED7299C-6693-4FE7-A502-5E94A4DC1041') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('FED7299C-6693-4FE7-A502-5E94A4DC1041', 'war/warehouse/thanh-pham-xuat/detail/view', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'F370819A-7433-41E0-80F6-ED871E172EA6') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('F370819A-7433-41E0-80F6-ED871E172EA6', 'war/warehouse/thanh-pham-xuat/detail/confirm', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'D29753BD-B228-4EDD-81C6-3A851E49D2EB') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('D29753BD-B228-4EDD-81C6-3A851E49D2EB', 'war/warehouse/thanh-pham-xuat/detail/add', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'A96393E9-3D71-47FF-B74A-7DD2C54EDCC5') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('A96393E9-3D71-47FF-B74A-7DD2C54EDCC5', 'war/warehouse/thanh-pham-xuat/detail/delete', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '812B0B9C-9081-49DF-AED5-0202B9730507') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('812B0B9C-9081-49DF-AED5-0202B9730507', 'war/warehouse/kho-thanh-pham/bao-cao-ton-kho/view', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '5AC6533A-7F37-4FA0-B08C-D0B81BFAEC98') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('5AC6533A-7F37-4FA0-B08C-D0B81BFAEC98', 'war/warehouse/kho-thanh-pham/bao-cao-ton-kho/download', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '7D2541A9-E403-42BE-BB8E-142C654D1EAE') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('7D2541A9-E403-42BE-BB8E-142C654D1EAE', 'war/warehouse/kho-san-xuat-nhap/detail/view', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '11FB23D6-531D-4503-B572-11A6003C5428') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('11FB23D6-531D-4503-B572-11A6003C5428', 'war/warehouse/kho-san-xuat-nhap/detail/warehouse', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'B7055503-8A17-4C30-9CF6-0FD3C3B71E9D') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('B7055503-8A17-4C30-9CF6-0FD3C3B71E9D', 'war/warehouse/danh-sach-xuat-kho/list/view', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '074A56B1-0F14-4DB2-846E-69B158ECCDB7') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('074A56B1-0F14-4DB2-846E-69B158ECCDB7', 'war/warehouse/danh-sach-xuat-kho/list/add', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'D084FDEB-23D6-45C5-8983-FFC795FE98E0') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('D084FDEB-23D6-45C5-8983-FFC795FE98E0', 'war/warehouse/danh-sach-xuat-kho/list/delete', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'B1C1B2E0-D05D-4666-A50F-77BB630C5882') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('B1C1B2E0-D05D-4666-A50F-77BB630C5882', 'war/warehouse/tao-moi-xuat-kho/create/view', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '352BCDE6-C5AF-4FDD-902B-A531FEE06707') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('352BCDE6-C5AF-4FDD-902B-A531FEE06707', 'war/warehouse/tao-moi-xuat-kho/create/add', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = '06250D3B-5BA7-445F-A45A-93EB711B6FCC') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('06250D3B-5BA7-445F-A45A-93EB711B6FCC', 'war/warehouse/tao-moi-xuat-kho/create/delete', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'C7FC820D-E6E4-4A13-9E3D-26C1D68356C9') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('C7FC820D-E6E4-4A13-9E3D-26C1D68356C9', 'war/warehouse/inventory-receiving-voucher/detail/edit-complete', null);
END IF;
END $$;

DO $$
BEGIN
IF NOT EXISTS (select * from public."ActionResource" where "ActionResourceId" = 'E7315D2A-C3DF-45A3-9A86-15599596C9D0') THEN
	INSERT INTO public."ActionResource" ("ActionResourceId", "ActionResource", "Description") VALUES ('E7315D2A-C3DF-45A3-9A86-15599596C9D0', 'war/warehouse/inventory-delivery-voucher/detail/edit-complete', null);
END IF;
END $$;