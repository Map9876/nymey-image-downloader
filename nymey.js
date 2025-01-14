const express = require('express');
const fetch = (url, init) => import('node-fetch').then(module => module.default(url, init)); //https://github.com/node-fetch/node-fetch/discussions/1579 TypeError: fetch is not a function或者 import fetch from "node-fetch";
const path = require('path');
const app = express();
const port = 3002;
const https = require('https');
// 允许跨域请求（CORS）
const cors = require('cors');
app.use(cors());
// 提供静态文件
app.use(express.static(path.join(__dirname, './')));
// 定义API接口
app.get('/api/accessToken', async (req, res) => {
    try {
        // 请求原网站获取HTML
        const htmlResponse = await fetch('https://nymey.com/geo-restriction/', {
        agent: new https.Agent({
            rejectUnauthorized: false
        })
        });
        console.log("CEO")
        const html = await htmlResponse.text();
        const tokenMatch = html.match(/localStorage.setItem\('access_token', "([^"]+)/);
        const accessToken = tokenMatch ? tokenMatch[1] : null;
        console.log("token", accessToken) //toke正常获取
        if (!accessToken) {
            console.error('Failed to retrieve access token');
            return res.status(500).json({ error: 'Failed to retrieve access token' });
        }
        // 使用获取到的access token请求内容数据
        
        
        res.json({ accessToken });
       } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});


app.get('/api/content', async (req, res) => {
    try {
    
    let accessToken = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
    
    if (!accessToken) {
            // 自动获取新的 access token
            const htmlResponse = await fetch('https://nymey.com/geo-restriction/', {
                agent: new https.Agent({
                    rejectUnauthorized: false
                })
            });
            const html = await htmlResponse.text();
            const tokenMatch = html.match(/localStorage.setItem\('access_token', "([^"]+)/);
            accessToken = tokenMatch ? tokenMatch[1] : null;
            
            if (!accessToken) {
                console.error('Failed to retrieve access token');
                return res.status(500).json({ error: 'Failed to retrieve access token' });
            }
        }    
    
    /* 
        const htmlResponse = await fetch('https://nymey.com/geo-restriction/', {
        agent: new https.Agent({
            rejectUnauthorized: false
        })
        });
        console.log("CEO")
        const html = await htmlResponse.text();
        const tokenMatch = html.match(/localStorage.setItem\('access_token', "([^"]+)/);
        const accessToken = tokenMatch ? tokenMatch[1] : null;
        console.log("token", accessToken) //toke正常获取
        if (!accessToken) {
            console.error('Failed to retrieve access token');
            return res.status(500).json({ error: 'Failed to retrieve access token' });
        } 
        
                      
    */
    
 

        const dataResponse = await fetch('https://apigateway.muvi.com/content', {
            method: 'POST',
            headers: {
                'accept': 'application/json, text/plain, */*',
                'authorization': `Bearer ${accessToken}`,
                'cache-control': 'no-cache',
                'content-type': 'application/json',
                'origin': 'https://nymey.com',
                'referer': 'https://nymey.com/',
                'sec-ch-ua': '"Not-A.Brand";v="99", "Chromium";v="124"',
                'sec-ch-ua-mobile': '?1',
                'sec-ch-ua-platform': 'Android',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
            },
            body: JSON.stringify({
                query: `{featuredContentList(user_type:":user_type",end_user_uuid: ":me",ip_address:":ip",app_token: ":app_token", product_key: ":product_key", store_key:":store_key", user_uuid:":me", feature_section_uuid:"",page_content:1,per_page_content:12,content_asset_type:"", maturity_rating_uuid: ":maturity_rating_uuid", profile_uuid:":profile_uuid"){featured_content_list {feature_section_type feature_section_name feature_section_uuid section_content_list {page_info{total_count} content_list{document_details{document_uuid file_url original_file_name file_name} maturity_rating content_created_by user_type is_encoded is_playlist is_parent app_token product_key content_name is_free_content content_permalink content_search_tag content_trailer_uuid content_uuid content_parent_uuid content_desc content_asset_type content_asset_uuid no_image_available_url content_level categories{ category_name } trailer_details {video_uuid file_name file_url} video_details {is_feed encoding_status encoding_end_time file_name third_party_url } audio_details {audio_uuid encoding_status file_name } posters {website{file_uuid file_url file_name} tv_apps{file_uuid file_url file_name} mobile_apps{file_uuid file_url file_name} } banners {website{file_uuid file_url file_name} tv_apps{file_uuid file_url file_name} mobile_apps{file_uuid file_url file_name}} }}}}}`
            }),
   rejectUnauthorized: false         
        },
        
        
        );
        // 检查响应状态
        if (!dataResponse.ok) {
            console.error('Failed to fetch data from API', dataResponse.statusText);
            return res.status(500).json({ error: 'Failed to fetch data from API' }); //返回码可以自定义，前端只能看到这个
        }
        const data = await dataResponse.json();
        console.log("muvi数据", data)
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}/`);
    console.log(`http://localhost:${port}/api/content/`)
});
//这样访问http://localhost:3000/api/content 就相当于访问原网站，同理比如做一个srt转换的，给他数据也可以，就相当于一个功能性软件
